const bcrypt = require('bcryptjs');

async function hashPasswords() {
  const passwords = [
    { id: 1, plain: 'Admin@123'   },
    { id: 2, plain: 'Anjali@123'  },
    { id: 3, plain: 'Vikram@123'  },
    { id: 4, plain: 'Priya@123'   },
  ];

  for (const user of passwords) {
    const hashed = await bcrypt.hash(user.plain, 10);
    console.log(`UPDATE users SET password = '${hashed}' WHERE id = ${user.id};`);
  }
}

hashPasswords();