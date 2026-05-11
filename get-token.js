const { initializeApp } = require('firebase/app');
const { getAuth, signInWithEmailAndPassword } = require('firebase/auth');

const app = initializeApp({
  apiKey:    "AIzaSyDtStLnwfXqwv2iVXQqbtGgy3TBI0xHumY",
  projectId: "quincaillerie-gestquick",
});

const auth = getAuth(app);

signInWithEmailAndPassword(auth, "sambamoussadiouf@gmail.com", "smd1608")
  .then(cred => cred.user.getIdToken())
  .then(token => {
    console.log('\n✅ TOKEN:\n');
    console.log(token);
  })
  .catch(err => {
    console.error('❌ Erreur:', err.message);
  });