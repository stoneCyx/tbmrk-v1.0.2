const mongoose = require('../dal/mongoose');
const User = require('../models/User');
var Schema = mongoose.Schema;

var CommentSchema = new Schema({
	aid:{
		type: Schema.Types.ObjectId,
		ref: 'Article'
	},
	userId:{
		type: Schema.Types.ObjectId,
		ref:'User'
	},
	content:String,
	status:{ type :Number, default:1 },
	created: { type: Date, default: Date.now },
	updated: { type: Date, default: Date.now },
	pid:{
		type:Schema.Types.ObjectId,
		ref:'Comment'
	}
},{collection:'Comment'});

var Comment = mongoose.model('Comment',CommentSchema);

module.exports = Comment;