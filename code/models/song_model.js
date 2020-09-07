const db = require('../utils/db');

module.exports = {
    all: () => db.load('select * from song'),
    single: id_bai_hat => db.load( `select * from song where id_bai_hat = ${id_bai_hat}`),
    add: entity => db.add('song',entity),
    del: id_bai_hat=>  db.del('song',{id_bai_hat: id_bai_hat}),
    singleByUsername: async id_bai_hat =>{
        const rows = await db.load(`select * from song where id_bai_hat = '${id_bai_hat}'`);
        if (rows.length === 0)
          return null;
    
        return rows[0];;
      },
      patch: entity => {
        const condition = { id_bai_hat: entity.id_bai_hat };
        delete entity.id_bai_hat;
        return db.patch('song', entity, condition);
      },
    

}