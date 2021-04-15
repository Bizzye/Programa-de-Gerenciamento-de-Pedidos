import { Injectable } from '@angular/core';
import { AngularFirestore } from '@angular/fire/firestore';

@Injectable({
  providedIn: 'root'
})
export class UserService {

  constructor(private fire: AngularFirestore) { }


  getUsers() {
    return new Promise((resolve, reject) => {
      this.fire.collection("users").ref.limit(10).orderBy('id', 'desc').get().then(users => {
        let usersData = [];
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
