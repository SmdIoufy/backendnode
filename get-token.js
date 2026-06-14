const { initializeApp } = require('firebase/app');
const { getAuth, signInWithEmailAndPassword } = require('firebase/auth');

const app = initializeApp({
  apiKey:    "AIzaSyDtStLnwfXqwv2iVXQqbtGgy3TBI0xHumY",
  projectId: "quincaillerie-gestquick",
});

const auth = getAuth(app);

function decodeJwtPayload(token) {
  const parts = token.split('.');

  if (parts.length !== 3) {
    throw new Error('Le token ne ressemble pas à un JWT valide.');
  }

  const payload = parts[1]
    .replace(/-/g, '+')
    .replace(/_/g, '/');
  const paddedPayload = payload.padEnd(Math.ceil(payload.length / 4) * 4, '=');

  return JSON.parse(Buffer.from(paddedPayload, 'base64').toString('utf8'));
}

signInWithEmailAndPassword(auth, "sambamoussadiouf@gmail.com", "admin1608")
  .then(cred => cred.user.getIdToken())
  .then(token => {
    const cleanToken = token.replace(/\s+/g, '');
    const claims = decodeJwtPayload(cleanToken);

    console.log('\n✅ TOKEN (copie tout sur une ligne):\n');
    console.log(cleanToken);
    console.log('\n');

    if (Object.prototype.hasOwnProperty.call(claims, 'role')) {
      console.log('✅ role trouvé dans le token :', claims.role);
    } else {
      console.log('ℹ️ Aucun champ role dans le token.');
    }

    console.log('\nClaims décodés :');
    console.log(JSON.stringify(claims, null, 2));
  })
  .catch(err => {
    console.error('❌ Erreur:', err.message);
  });