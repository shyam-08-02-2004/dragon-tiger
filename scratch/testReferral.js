const fetch = require('node-fetch');
(async () => {
  try {
    // Create referrer user
    const refRes = await fetch('http://localhost:3000/api/auth/signup', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: '1111111111', username: 'refUser', password: 'pass' })
    });
    const refData = await refRes.json();
    console.log('Referrer created:', refData);
    // Create new user using referral code
    const newRes = await fetch('http://localhost:3000/api/auth/signup', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: '2222222222', username: 'newUser', password: 'pass', referralCode: refData.referralCode })
    });
    const newData = await newRes.json();
    console.log('New user created with referral:', newData);
    // Retrieve referrer after referral bonus applied
    const getRef = await fetch(`http://localhost:3000/api/users/${refData.id}`);
    const refInfo = await getRef.json();
    console.log('Referrer after referral:', refInfo);
  } catch (err) {
    console.error('Error:', err);
  }
})();
