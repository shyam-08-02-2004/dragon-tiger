import fetch from 'node-fetch';
(async () => {
  try {
    // Create referrer
    const refRes = await fetch('http://localhost:3000/api/auth/signup', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: '1111111111', username: 'refUser', password: 'pass' })
    });
    const refData = await refRes.json();
    console.log('Referrer created:', refData);
    // Create new user with referral code
    const newRes = await fetch('http://localhost:3000/api/auth/signup', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: '2222222222', username: 'newUser', password: 'pass', referralCode: refData.referralCode })
    });
    const newData = await newRes.json();
    console.log('New user created with referral:', newData);
    // Get referrer after referral
    const refInfoRes = await fetch(`http://localhost:3000/api/users/${refData.id}`);
    const refInfo = await refInfoRes.json();
    console.log('Referrer after referral:', refInfo);
  } catch (err) {
    console.error('Error:', err);
  }
})();
