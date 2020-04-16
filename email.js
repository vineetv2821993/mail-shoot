var nodemailer = require("nodemailer");
var EventEmitter = require("events").EventEmitter;
var util = require("util");
var _ = require("lodash");
var transporter = null;
/*
 * constructor
 * parameter will be an object containing id no., userid, pass,userlist,SMTPconfig,SMTPconfiglist
 */

var emails = function (senderDetail) {
	// create reusable transporter object using SMTP transport
	var self = this;
	self.id = senderDetail.id;
	self.user = senderDetail.user;
	self.pass = senderDetail.pass;
	self.userList = senderDetail.userList;
	self.smtpConfig = senderDetail.smtpConfig;
	self.smtpConfigList = senderDetail.smtpConfigList;
	EventEmitter.call(self);
};

util.inherits(emails, EventEmitter);
/*
 * switch ids for sending mail
 * will be called everytime after sending a mail
 */
emails.prototype.switchUser = function () {
	var self = this;

	self.id = (self.id + 1) % self.userList.length;
	self.user = self.userList[self.id];
	self.smtpConfig = self.smtpConfigList[self.id];
	// self.initialize();
};
/*
 * gives value to transporter
 */
emails.prototype.initialize = function () {
	var self = this;
	// create reusable transporter object using the default SMTP transport
	transporter = nodemailer.createTransport(self.smtpConfig);
};

/*
 * send mail
 */

emails.prototype.send = function (options, callback) {
	transporter.sendMail(options, function (error, info) {
		callback(error, info);
	});
};
/*
 * compose mail
 * user will be a valid email id
 * body is optional
 */

emails.prototype.compose = function (from, user, subject, body, attatchments, callback) {
	var self = this;
	// Convert HTML to String : http://pojo.sodhanalibrary.com/string.html
	// Message for Form
	var message = null;
	if (body === null) {
		message = "<div>Hello User</div>";
	} else {
		message = body;
	}
	var mailOptions = {
		from: from + "<" + self.user + ">", // sender address
		to: user, // list of receivers
		// cc: 'Naxap <naxappvtltd@gmail.com>',
		subject: subject + " ✔", // Subject line
		text: from + " - " + subject + " ✔", // plaintext body
		html: message, // html body
		attachments: attatchments
	};
	self.send(mailOptions, function (err, info) {
		if (!err) {
			self.switchUser();
			return callback(null, { status: true, msg: "OPERATION_COMPLETE", user: user });
		} else {
			__error("emails : transporter : Switching User : In Error : ", err);
			self.switchUser();
			return callback(err, { status: false, msg: "OPERATION_FAILED", user: user });
		}
	});
};
module.exports = emails;
