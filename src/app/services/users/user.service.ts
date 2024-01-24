import { Injectable } from '@angular/core';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { Observable, combineLatest, map, of, shareReplay, switchMap, take } from 'rxjs';
import { ICustomer } from 'src/app/interfaces/customer/customer.interface';

@Injectable({
  providedIn: 'root'
})
export class UserService {

  constructor(
    private fire: AngularFirestore,
    private db: AngularFirestore,
  ) { }


  getCustomer() {
    return this.db.collection("users", ref => {
      return ref.orderBy('id', 'desc').limit(10)
    }).get().pipe(
      map(res => {
        if(res.empty) {
          return []
        }

        return res.docs.map(docs => docs.data() as ICustomer);
      }),
      take(1),
      shareReplay()
    );
  }

  searchCustomer(str: string): Observable<ICustomer[]> {
    const intStr = parseInt(str);

    if(intStr == 8) {
      return this.searchCustomerByPhone(intStr);
    }

    return this.searchCustomerByName(str);
  }

  searchCustomerByName(name: string) {
    const nameUpper = name.toUpperCase();

    let contains: any[] = [];
    let firstName: any[] = [];
    let secondName: any[] = [];
    let thirdName: any[] = [];

    for(const name of nameUpper.split(' ')) {
      let consulta1 = this.db.collection("users", ref => {
        return ref.where('fullName', 'array-contains', name)
      }).get();

      let consulta2 = this.db.collection("users", ref => {
        return ref.where('name1', '==', name)
      }).get();

      let consulta3 = this.db.collection("users", ref => {
        return ref.where('name2', '==', name)
      }).get();

      let consulta4 = this.db.collection("users", ref => {
        return ref.where('name3', '==', name)
      }).get();

      contains.push(consulta1);
      firstName.push(consulta2);
      secondName.push(consulta3);
      thirdName.push(consulta4);
    }

    console.log(contains)
    return combineLatest([[...contains, ...firstName, ...secondName, ...thirdName]]).pipe(
      switchMap((item: any) => {
        console.log(item)

        if(item?.data()) {
          return item.data();
        }
        
        return item
      })
    )

    // const contains = this.db.collection("users", ref => {
    //   return ref.where('fullName', 'array-contains', firstName)
    // }).get();

    // const firstName1 = this.db.collection("users", ref => {
    //   return ref.where('name1', '==', firstName)
    // }).get();

    // const firstName2 = this.db.collection("users", ref => {
    //   return ref.where('name2', '==', firstName)
    // }).get();

    // const firstName3 = this.db.collection("users", ref => {
    //   return ref.where('name3', '==', firstName)
    // }).get();

    // let secondName1: Observable<any> = of([]);
    // let secondName2: Observable<any> = of([]);
    // let secondName3: Observable<any> = of([]);
    // let contains2: Observable<any> = of([]);

    // let thirdName1: Observable<any> = of([]);
    // let thirdName2: Observable<any> = of([]);
    // let thirdName3: Observable<any> = of([]);
    // let contains3: Observable<any> = of([]);

    // if(secondName) {
    //   contains2 = this.db.collection("users", ref => {
    //     return ref.where('fullName', 'array-contains', secondName)
    //   }).get();
  
    //   secondName1 = this.db.collection("users", ref => {
    //     return ref.where('name1', '==', secondName)
    //   }).get();
  
    //   secondName2 = this.db.collection("users", ref => {
    //     return ref.where('name2', '==', secondName)
    //   }).get();
  
    //   secondName3 = this.db.collection("users", ref => {
    //     return ref.where('name3', '==', secondName)
    //   }).get();
    // }

    // if(thirdName) {
    //   contains3 = this.db.collection("users", ref => {
    //     return ref.where('fullName', 'array-contains', thirdName)
    //   }).get();
  
    //   thirdName1 = this.db.collection("users", ref => {
    //     return ref.where('name1', '==', thirdName)
    //   }).get();
  
    //   thirdName2 = this.db.collection("users", ref => {
    //     return ref.where('name2', '==', thirdName)
    //   }).get();
  
    //   thirdName3 = this.db.collection("users", ref => {
    //     return ref.where('name3', '==', thirdName)
    //   }).get();
    // }

    // return new Promise((resolve, reject) => {
    //   name = name.toUpperCase();
    //   let len = name.split(' ').length;
    //   if (len == 0) {
    //     reject();
    //   }
    //   let firstName = '';
    //   let secondName = '';
    //   let thirdName = '';
    //   if (len == 1) {
    //     firstName = name.split(' ')[0];
    //     this.fire.collection('users').ref.where('nome1', '==', firstName).get().then(first => {
    //       this.fire.collection('users').ref.where('nome2', '==', firstName).get().then(second => {
    //         this.fire.collection('users').ref.where('nome3', '==', firstName).get().then(third => {
    //           let users = []
    //           first.docs.map(doc => users.push(doc.data()));
    //           second.docs.map(doc => users.push(doc.data()));
    //           third.docs.map(doc => users.push(doc.data()));
    //           console.log(first.docs.length);
    //           console.log(second.docs.length);
    //           console.log(third.docs.length);
    //           resolve(users);
    //         }).catch(err => {
    //           console.log(err);
    //           reject(err);
    //         });
    //       }).catch(err => {
    //         console.log(err);
    //         reject(err);
    //       });
    //     }).catch(err => {
    //       console.log(err);
    //       reject(err);
    //     });
    //   } else if (len == 2) {
    //     firstName = name.split(' ')[0];
    //     secondName = name.split(' ')[1];
    //     this.fire.collection('users').ref.where('nome1', '==', firstName)
    //       .where('nome2', '==', secondName).get().then(user => {
    //         let users = [];
    //         user.docs.map(usr => users.push(usr.data()));
    //         console.log(user.docs.length);
    //         resolve(users);
    //       }).catch(err => {
    //         console.log(err);
    //         reject(err);
    //       });
    //   } else if (len == 3) {
    //     firstName = name.split(' ')[0];
    //     secondName = name.split(' ')[1];
    //     thirdName = name.split(' ')[2];
    //     this.fire.collection('users').ref.where('nome1', '==', firstName)
    //       .where('nome2', '==', secondName)
    //       .where('nome3', '==', thirdName).get().then(user => {
    //         let users = [];
    //         user.docs.map(usr => users.push(usr.data()));
    //         console.log(user.docs.length);
    //         resolve(users);
    //       }).catch(err => {
    //         console.log(err);
    //         reject(err);
    //       });
    //   }
    // });
  }

  searchCustomerByPhone(phone: number) {
    return this.db.collection("users", ref => {
      return ref.where('phone', '==', phone)
    }).get().pipe(
      map(res => {
        if(res.empty) {
          return []
        }

        return res.docs.map(docs => docs.data() as ICustomer);
      }),
      take(1),
      shareReplay()
    );
  }



  getUsers() {
    return new Promise((resolve, reject) => {
      this.fire.collection("users").ref.orderBy('id', 'desc').limit(10).get().then(users => {
        let usersData = [];
        console.log('usersData');
        users.docs.map(user => usersData.push(user.data()));
        resolve(usersData);
      }).catch(err => {
        reject();
      });
    });
  }

  async searchUserByName(name) {
    return new Promise((resolve, reject) => {
      name = name.toUpperCase();
      let len = name.split(' ').length;
      if (len == 0) {
        reject();
      }
      let firstName = '';
      let secondName = '';
      let thirdName = '';
      if (len == 1) {
        firstName = name.split(' ')[0];
        this.fire.collection('users').ref.where('nome1', '==', firstName).get().then(first => {
          this.fire.collection('users').ref.where('nome2', '==', firstName).get().then(second => {
            this.fire.collection('users').ref.where('nome3', '==', firstName).get().then(third => {
              let users = []
              first.docs.map(doc => users.push(doc.data()));
              second.docs.map(doc => users.push(doc.data()));
              third.docs.map(doc => users.push(doc.data()));
              console.log(first.docs.length);
              console.log(second.docs.length);
              console.log(third.docs.length);
              resolve(users);
            }).catch(err => {
              console.log(err);
              reject(err);
            });
          }).catch(err => {
            console.log(err);
            reject(err);
          });
        }).catch(err => {
          console.log(err);
          reject(err);
        });
      } else if (len == 2) {
        firstName = name.split(' ')[0];
        secondName = name.split(' ')[1];
        this.fire.collection('users').ref.where('nome1', '==', firstName)
          .where('nome2', '==', secondName).get().then(user => {
            let users = [];
            user.docs.map(usr => users.push(usr.data()));
            console.log(user.docs.length);
            resolve(users);
          }).catch(err => {
            console.log(err);
            reject(err);
          });
      } else if (len == 3) {
        firstName = name.split(' ')[0];
        secondName = name.split(' ')[1];
        thirdName = name.split(' ')[2];
        this.fire.collection('users').ref.where('nome1', '==', firstName)
          .where('nome2', '==', secondName)
          .where('nome3', '==', thirdName).get().then(user => {
            let users = [];
            user.docs.map(usr => users.push(usr.data()));
            console.log(user.docs.length);
            resolve(users);
          }).catch(err => {
            console.log(err);
            reject(err);
          });
      }
    });
  }

  searchUserByPhone(phone) {
    phone = parseInt(phone, 10);
    return new Promise((resolve, reject) => {
      this.fire.collection('users').ref.where('phone', '==', phone).get().then(users => {
        let usersData = [];
        users.docs.map(user => usersData.push(user.data()));
        console.log(users.docs.length);
        resolve(usersData);
      }).catch(err => {
        reject(err);
      });
    });
  }

  async insertUser(body) {
    try {
      let id = new Date().getTime().toString();
      body.id = id
      return await this.fire.collection('users').doc(id).set(body);
    } catch (err) {
      console.log(err)
      return err
    }
  }

  async removeUser(id) {
    try {
      return await this.fire.collection('users').doc(id).delete();
    } catch (err) {
      console.log(err)
      return err
    }
  }

}
