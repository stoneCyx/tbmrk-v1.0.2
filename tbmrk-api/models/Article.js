const mongoose = require('../dal/mongoose');
const Schema = mongoose.Schema;

const articleSchema = new Schema({
	authId:{
        type: Schema.Types.ObjectId,
		ref: 'User'
	},
	title: String,
	content: String,
	image: { type: String , default: '/static/img/logo.jpg' },
	tag: String,
	weather: String,
	created: { type: Date, default: Date.now },
	updated: { type: Date, default: null },
	status: { type:Number, default:1 },
	commentCount: { type:Number, default:0 },
	collectCount: { type:Number, default:0 },
	pv: { type:Number, default:0 }
},{ collection: 'Article' });

const Article = mongoose.model('Article',articleSchema);


module.exports = Article;
