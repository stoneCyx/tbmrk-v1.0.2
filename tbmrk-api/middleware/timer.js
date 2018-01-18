// middleware/timer.js
module.exports = function() {
  return  function *(next) {
   console.log('------------>')
    yield next;
   
  }
};