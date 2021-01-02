import { Injectable } from '@angular/core';
import { AngularFirestore, AngularFirestoreCollection } from '@angular/fire/firestore';
import { Mensaje } from '../interface/mensaje.interface';
import { map } from 'rxjs/operators';

// Para login
import { AngularFireAuth } from '@angular/fire/auth';
import * as firebase from 'firebase/app';
// import firebase from 'firebase/app';


@Injectable({
  providedIn: 'root'
})
export class ChatService {

  chats: Mensaje[]=[];
  private itemsCollection: AngularFirestoreCollection<Mensaje>;
  public usuario: any={};

  constructor(private afs: AngularFirestore,public fbauth: AngularFireAuth) { 
    this.fbauth.authState.subscribe(resp => {
      console.log('Estado de la respuesta ',resp);

      if( !resp){
        return;
      }

      console.log(resp);

      this.usuario.nombre= resp.displayName;
      this.usuario.uid= resp.uid;
      console.log(this.usuario);

    });
  }

  login(proveedor: string) {
    if(proveedor == 'google'){
      this.fbauth.auth.signInWithPopup(new firebase.auth.GoogleAuthProvider());
    }else{
      this.fbauth.auth.signInWithPopup(new firebase.auth.TwitterAuthProvider());
    }
  }
  logout() {
    this.usuario={};
    this.fbauth.auth.signOut();
  }

  cargarMensajes(){
    this.itemsCollection = this.afs.collection<Mensaje>('chats', ref => ref.orderBy('fecha','desc').limit(5));
    return this.itemsCollection.valueChanges().pipe(
                                map((mensajes:Mensaje[]) => {
                                  // console.log(mensajes);

                                  this.chats=[]

                                  for( let mensaje of mensajes){
                                    this.chats.unshift(mensaje);
                                  }

                                  return this.chats;
                              })

    );
  }

  agregarMensaje(texto: string){
    let mensaje: Mensaje={
      nombre: this.usuario.nombre,
      mensaje: texto,
      fecha: new Date().getTime(),
      uid: this.usuario.uid
    }

    return this.itemsCollection.add(mensaje);
  }

}
