const mongoose = require('../dal/mongoose');
var Schema = mongoose.Schema;

var AlbumSchema = new Schema({
  userId:{
    type: Schema.Types.ObjectId,
    ref:'User'
  },
  photo: String,
  thumbnail: String,
  name: String,
  likeCount: { type:Number, default:0 },
  likeToday: [{
    userIp: String,
    date: { type: Date, default: Date.now }
  }],
  status:{ type :Number, default:1 },
  created: { type: Date, default: Date.now }
},{collection:'Album'});

var Album = mongoose.model('Album',AlbumSchema);

module.exports = Album;