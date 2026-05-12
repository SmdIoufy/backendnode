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
    // Token sur une seule ligne sans espace
    const cleanToken = token.replace(/\s+/g, '');
    console.log('\n✅ TOKEN (copie tout sur une ligne):\n');
    console.log(cleanToken);
    console.log('\n');
  })
  .catch(err => {
    console.error('❌ Erreur:', err.message);
  });