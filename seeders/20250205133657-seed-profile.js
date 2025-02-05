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
    let profiles = JSON.parse(await fs.readFile('./data/profiles.json', 'utf-8'));

    profiles = profiles.map (el =>{
     delete el.id
     return {
       ...el,
       createdAt: new Date(),
       updatedAt: new Date()
     }
    });
 
    await queryInterface.bulkInsert('Profiles', profiles, {});
   },
 
   async down (queryInterface, Sequelize) {
     /**
      * Add commands to revert seed here.
      *
      * Example:
      * await queryInterface.bulkDelete('People', null, {});
      */
     await queryInterface.bulkDelete('Profiles', null, {});
   }
 };