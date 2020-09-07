const db = require('../utils/db');

module.exports = {
    all: () => db.load('select * from song_user'),
    single: id_nguoi_hat => db.load( `select * from song_user where id_nguoi_hat = ${id_nguoi_hat}`),

    add: entity => db.add('song_user',entity),
    del: id_nguoi_hat=>  db.del('song_user',{id_nguoi_hat: id_nguoi_hat}),
    singleByUsername: async id_bai_hat =>{
        const rows = await db.load(`select * from song_user where id_bai_hat = '${id_bai_hat}'`);
        if (rows.length === 0)
          return null;
    
        return rows[0];;
      },
      patch: entity => {
        const condition = { id_bai_hat: entity.id_bai_hat };
        delete entity.id_bai_hat;
        return db.patch('song_user', entity, condition);
      }

}