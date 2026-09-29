# Hakunapp (legado, Angular + Firebase)

> ⚠️ **Projeto legado e congelado.** Esta branch (`legacy/angular`) guarda a última versão do Hakunapp em Angular + Firebase como referência.
> Ele está sendo **reescrito do zero** com outra stack (React, Hono, SQLite, Electron e Cloudflare) em dois repositórios novos: `hakuna-loja` e `hakuna-cardapio`.
> **Não evolua este código.** Use-o só para consultar como algo funcionava. Nenhum dado será migrado daqui.

---

## Sumário

- [O que é](#o-que-é)
- [O que faz (funcionalidades existentes)](#o-que-faz-funcionalidades-existentes)
- [Stack](#stack)
- [Estrutura do projeto](#estrutura-do-projeto)
- [Modelo de dados (Firestore)](#modelo-de-dados-firestore)
- [Como rodar (se precisar)](#como-rodar-se-precisar)
- [O que está errado / quebrado](#o-que-está-errado--quebrado)
- [Escopo original × o que foi entregue](#escopo-original--o-que-foi-entregue)
- [Por que foi substituído](#por-que-foi-substituído)

---

## O que é

O **Hakunapp** é um sistema interno de **gestão de pedidos** para uma lanchonete de batatas recheadas ("Hakuna"). Foi pensado para rodar no **PC do balcão**, como app desktop via Electron, e também no navegador (Firebase Hosting). Com ele, o atendente:

1. cadastra o cardápio;
2. cadastra e busca clientes;
3. monta o pedido (prato + adicionais + bebidas), informa entrega, pagamento e desconto;
4. salva o pedido e imprime numa impressora térmica.

Não existe visão do cliente final: o sistema é usado só pela loja.

---

## O que faz (funcionalidades existentes)

| Tela (rota) | Arquivos | O que faz |
|---|---|---|
| **Cardápio** (`/cardapio`) | `src/app/pages/cardapio/` | Cadastra itens com nome, preço e tipo (`prato`, `adicional`, `bebida`). Lista cada tipo numa tabela e permite remover. Não há edição, pausa, estoque, categoria nem foto. |
| **Clientes** (`/users`) | `src/app/pages/users/` + `components/table/` | Cadastra cliente (nome, telefone, endereço, ponto de referência) e lista os 10 mais recentes. Tem um campo de busca, mas a busca **não funciona** (ver bugs). |
| **Novo pedido** (`/produto`) | `src/app/pages/produto/` | Fluxo em passos: escolher pratos e bebidas; diálogo de adicionais com quantidade e observação; escolher cliente (lista ou busca); taxa de entrega; forma de pagamento (dinheiro, cartão, outro); desconto; "Finalizar compra" (salva no Firestore) e "Imprimir". **Esta tela está parcialmente quebrada.** |
| **Pedidos** (`/pedido`) | `src/app/pages/pedido/` | Lista os **últimos 50** pedidos com paginação local (10 por página) e mostra os detalhes de um pedido. |
| **Menu / Sidebar** | `src/app/components/menu/`, `components/sidebar/` | Navegação lateral com ícones SVG inline. |
| **Impressão** | `main.js` + `src/app/services/render/render.service.ts` | O Angular envia os dados do recibo via IPC (`print`) para o processo principal do Electron, que imprime com `electron-pos-printer` numa impressora fixa (`Diebold Procomp IM453HU_A`). |

---

## Stack

| Camada | Tecnologia |
|---|---|
| Frontend | Angular 16 (componentes standalone + `AppModule`), Angular Material (paginator, dialog, select), Tailwind 3, SCSS, SweetAlert2, ngx-mask |
| Banco | Firebase **Firestore**, acessado direto do browser (`@angular/fire/compat`), **sem backend** |
| Hospedagem web | Firebase Hosting (`firebase.json`, pasta `dist`) |
| Desktop | Electron 11 (`main.js`) + `electron-packager` / `electron-builder` |
| Impressão | `electron-pos-printer` via IPC |
| Datas | `moment` |
| Testes | Karma + Jasmine (só os specs gerados pelo CLI) e Protractor (deprecated). Não há testes reais |

Projetos Firebase usados:
- `hakunapp-dev`: em `src/environments/environment.ts`, usado por padrão no `ng serve`/`ng build`.
- `hakunapp-9281a`: em `src/environments/environment.prod.ts` e `.firebaserc`.

---

## Estrutura do projeto

```
├─ main.js                      # processo principal do Electron (janela + IPC de impressão)
├─ firebase.json / .firebaserc  # Firebase Hosting
├─ angular.json, tailwind.config.js, tsconfig*.json
├─ Hakuna chef/                 # documentos de escopo original (txt/rtf)
└─ src/
   ├─ environments/             # configs Firebase (dev e prod)
   └─ app/
      ├─ app-routing.module.ts  # rotas: cardapio, users, pedido, produto
      ├─ app.module.ts
      ├─ components/
      │  ├─ menu/               # botão/menu
      │  ├─ sidebar/            # navegação lateral (+ list-item)
      │  └─ table/              # tabela genérica de clientes (header, item, main)
      ├─ interfaces/            # ICustomer, IMenuItem, IUsersTable
      ├─ pages/
      │  ├─ cardapio/           # CRUD simples de itens
      │  ├─ users/              # clientes
      │  ├─ produto/            # NOVO PEDIDO (carrinho, adicionais, cliente, pagamento, impressão)
      │  └─ pedido/             # histórico de pedidos
      └─ services/
         ├─ products/           # Firestore: products
         ├─ users/              # Firestore: users (busca por nome/telefone)
         ├─ carrinho/           # Firestore: orders
         ├─ paginator/          # paginação em memória
         ├─ menu/               # estado aberto/fechado do menu
         └─ render/             # ponte IPC com o Electron
```

---

## Modelo de dados (Firestore)

Não há schema nem validação. Os documentos são gravados como o formulário estiver. Os IDs são `new Date().getTime().toString()`.

**`products`**
```ts
{ id: string, name: string, preco: number /* float em reais */, type: 'prato' | 'adicional' | 'bebida', qtd: 0 }
```

**`users`** (clientes)
```ts
{
  id: string,
  nome1: string, nome2: string, nome3: string,   // nome quebrado em até 3 partes, MAIÚSCULAS
  fullName: string[],                            // nome.split(' ') sem normalizar
  endereco: string, phone: number,               // telefone salvo como NUMBER
  ref: string                                    // ponto de referência
}
```

**`orders`**
```ts
{
  id: string,
  user: { nome1, nome2, nome3, endereco, ref, phone },  // cópia do cliente
  pedido: Array<{ name, preco, adc?: Array<produto adicional com qtd> }>,
  vEntrega: number, sub: number, vTotal: number, desconto: number,
  payment: 'money' | 'card' | 'other',
  datahora: { data: 'DD/MM/YYYY', hora: number /* unix */ }
}
```

---

## Como rodar (se precisar)

> O projeto mistura versões (Angular 16, Electron 11, Protractor, `angular` 1.x em devDependencies…). Espere avisos e possíveis falhas de instalação.

Requisitos prováveis: **Node 18** (compatível com Angular 16) e npm.

```bash
npm install
npm start                 # ng serve → http://localhost:4200 (usa o Firebase hakunapp-dev)
npm run build             # ng build → dist/
npm run start:electron    # build com base-href ./ e abre no Electron (impressão só funciona aqui)
npm run win64             # empacota para Windows x64 com electron-packager
```

Deploy web: `firebase deploy --only hosting` (exige login no Firebase CLI e acesso ao projeto).

---

## O que está errado / quebrado

### Bugs confirmados no código

| Onde | Problema | Efeito |
|---|---|---|
| `pages/produto/produto.component.html` | O template chama `stepper1()`, `stepper2()`, `step2`, `step3`, `openProd()`, `openDrink()`, `addItemCarrinho()` e `produtos`, que **não existem** no componente. O markup do fluxo também está **duplicado** (duas versões no mesmo arquivo). | Tela de novo pedido com partes quebradas, sem ação ou com erro de template |
| `produto.component.ts` → `sumTotal()` | `this.sub ?? 0` não atribui nada. Como `sub` começa `undefined`, a soma vira `NaN`. `sumTotal()` nem é chamado no fluxo | Subtotal errado |
| `produto.component.ts` → `addCarrinho()` | `vTotal` é `undefined`, então o total salvo fica `NaN`. Quando falta entrega ou pagamento, só preenche `message` e **salva mesmo assim**. Salva sem cliente | Pedidos gravados com total inválido e dados faltando |
| `produto.component.ts` → `addAD()` | A observação (`coment`) é descartada. O preço dos adicionais não entra no total. O item vai ao carrinho **sem `type`** | Observação perdida, total errado, prato não impresso |
| `print()` / `printData()` | Número do pedido sempre vazio. Impressora com nome fixo no código. Adicionais não são impressos. Índices de `splice` fixos (7/11) | Recibo incompleto; só funciona na impressora Diebold |
| `services/users/user.service.ts` → `searchCustomer()` | `parseInt(str) == 8` compara o **valor**, não a quantidade de dígitos | A busca por telefone nunca é acionada |
| `user.service.ts` → `searchCustomerByName()` | Consulta os campos `name1/name2/name3`, mas os dados são salvos como `nome1/nome2/nome3`. Além disso, `combineLatest([[...]])` recebe um array aninhado | **A busca de clientes por nome nunca encontra ninguém** |
| `pages/users/users.component.ts` | `search()` só faz `console.log`. `addCustomer()` atualiza `this.users`, mas o template usa `users$`. O template chama `addCustomer.fire()` (referência de SweetAlert) | Busca sem resultado na tela; lista não atualiza após cadastrar |
| Clientes | Telefone salvo como `number`, o que perde zero à esquerda e formatação. Nome cortado em 3 partes: nomes com 4+ palavras perdem parte | Dados inconsistentes, buscas falham |
| `pages/pedido/` | `limit(50)` fixo, sem filtro por data | Histórico inacessível além dos 50 últimos |
| IDs | `Date.getTime()` como ID | Pode colidir; não há número de pedido legível |
| Dinheiro | Valores em `float` (reais) | Erros de arredondamento |
| `app.component.html` (trecho comentado) | `routerLink="user"`, mas a rota é `users` | Link morto (inativo por estar comentado) |
| Sem rota padrão/404 | `routes` não tem `''` nem `'**'` | Abrir `/` mostra uma tela vazia |

### Segurança

- **Sem autenticação nenhuma.** Qualquer pessoa com a config do Firebase (commitada em `src/environments/`) acessa o Firestore direto do browser. Se as **regras do Firestore** estiverem abertas ou em modo teste, nomes, telefones e endereços dos clientes ficam públicos para leitura e escrita (**risco de LGPD**). Verifique e feche as regras no Console do Firebase.
- Electron com `nodeIntegration: true` e sem `contextIsolation`: qualquer conteúdo carregado tem acesso total à máquina.

### Dívida técnica

- Dependências mortas ou erradas no `package.json`: `angular` 1.x, `angular-route`, `jquery`, `electron-prebuilt`, `electron-prebuilt-compile`, `sqlite-sync` (sem uso), `protractor`, `tslint`, `moment` (deprecated), `@types/electron`, entre outras.
- Electron 11 (muito antigo), empacotamento misturando `electron-packager`, `electron-builder` e `electron-winstaller`.
- Mistura de `AppModule` com componentes standalone, `document.querySelector` dentro de componente, muitos `console.log` e código comentado.
- Serviços com Promises manuais aninhadas (callback hell) e funções duplicadas (`getUsers` × `getCustomer`, `searchUserByName` × `searchCustomerByName`).
- Nenhum teste real, nenhum CI.
- README original era o padrão do Angular CLI.

---

## Escopo original × o que foi entregue

Baseado em `Hakuna chef/Projeto inicial.txt` e `Hakuna chef/step by step.rtf`:

| Requisito original | Situação |
|---|---|
| Clientes: armazenar, adicionar, editar e remover | ⚠️ Cadastra e lista; **sem edição**; remoção só no service; busca quebrada |
| Busca por telefone ou nome | ❌ Quebrada |
| Desconto por cliente | ❌ Não existe (só desconto manual no pedido) |
| Cardápio com quantidade disponível | ❌ Campo `qtd` gravado, mas não usado |
| Pausar/excluir item | ⚠️ Só excluir |
| Batata "Monte seu sabor", remover ingredientes | ❌ Não existe |
| Extras/adicionais | ⚠️ Existe, mas o preço não soma e a observação se perde |
| Observações | ❌ Descartadas |
| Taxa de entrega | ⚠️ Campo manual |
| Impressão em 3 vias (pedido, cliente, endereço, pagamento, troco, logo, data, entregador, iFood pago, total) | ⚠️ Uma via, incompleta, sem número, logo, troco ou entregador |
| Vendas: total do dia/mês/ano por dinheiro/cartão, quantidade por tipo de batata, desconto iFood | ❌ Não existe |
| Histórico e fechamento do dia | ⚠️ Só a lista dos últimos 50 pedidos |

---

## Por que foi substituído

- Muitos fluxos centrais quebrados (pedido, busca de clientes, totais) e nenhuma parte de vendas/relatórios.
- Dependência total de internet (Firestore direto do browser), o que não serve para o PDV de uma loja.
- Sem autenticação e sem regras de negócio no servidor.
- Base desatualizada e sem testes, o que torna mais barato reescrever do que corrigir.

A nova versão (planejada em `PLANO-HAKUNA.md`, fora desta branch) resolve isso com:
- sistema da loja **offline-first** (Electron + servidor local + SQLite);
- cardápio digital para o cliente pedir da mesa (`cardapioX.com/<loja>`);
- impressão térmica USB configurável, caixa e relatórios;
- testes do começo ao fim.
