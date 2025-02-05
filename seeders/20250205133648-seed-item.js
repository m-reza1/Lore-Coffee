'use strict';
const fs = require('fs').promises;

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    /**
     * Add seed commands here.
     *
     * Example:
     * await queryInterface.bulkInsert('People', [{
     *   name: 'John Doe',
     *   isBetaMember: false
     * }], {});
    */
    let items = JSON.parse(await fs.readFile('./data/items.json', 'utf-8'));

    items = items.map (el =>{
     delete el.id
     return {
       ...el,
       createdAt: new Date(),
       updatedAt: new Date()
     }
    });
 
    await queryInterface.bulkInsert('Items', items, {});
   },
 
   async down (queryInterface, Sequelize) {
     /**
      * Add commands to revert seed here.
      *
      * Example:
      * await queryInterface.bulkDelete('People', null, {});
      */
     await queryInterface.bulkDelete('Items', null, {});
   }
 };