/*
 * Modules Included : Express, Cron, Queue, Async, Request, Deasync; Deasync All calls here untill App Initializes
 */
const fs = require("fs");
const cron = require("cron");
const path = require("path");
const deasync = require("deasync");
const readConfig = require("jsonfile").readFileSync;

//Load Config File
try {
	var config = readConfig(process.argv[2] || "config.json");
} catch (e) {
	console.log(
		"[error] " + new Date().toGMTString() + " : Config Not Found."
	);
	return process.exit(-1);
}

//Global Inspection Function
global.__inspect = function(obj, stringify) {
	console.log(
		"[inspect] " + new Date().toGMTString() + " : OBJECT => ",
		stringify ? JSON.stringify(obj) : obj
	);
	return obj;
};

global.__downloadPath = config.paths.downloads || "./downloads";
global.__logPath = config.paths.logs || "./logs";
global.__sessionPath = config.paths.sessions || "./sessions";
global.__loginPath = config.paths.login || "./login";
global.__activePath = config.paths.active || "./active";
global.__appRoot = path.resolve(__dirname);

// Create Project Directories if Not exists
const dirs = [
	__downloadPath,
	__logPath,
	__sessionPath,
	__loginPath,
	__activePath
];
dirs.forEach(dir => {
	if (!fs.existsSync(dir)) {
		fs.mkdirSync(dir);
	}
});

//Load rest of the modules here
const uuidv3 = require("uuid/v3");
const publicIp = deasync(function(cb) {
	require("public-ip")
		.v4()
		.then(ip => {
			return cb(null, ip);
		})
		.catch(err => {
			return cb(err, null);
		});
});

//Global Variable
process.env.NODE_ENV = config.currentEnv;
global.__namespace = config.namespace;
global.__asset_namespace = config.asset_namespace;
global.__ENV_LIST = config.environments;

//Global Variable for UI
global.__enableUI = config.enableUI;
global.__sessionMode = config.sessionMode;
global.__sessionSecret = config.sessionSecret;
global.__redisConfig = config.redisConfig;
global.__saveUserInfo = config.saveUserInfo;

//Id for demo user account
global.__demoId = config.demoId;

//Location of Infinity API Server
global.__infinity = config.infinity;

//Load API Keys
global.__login = config.login;
global.__payment = config.payment;

//Set logger
if (process.env.NODE_ENV == global.__ENV_LIST.development) {
	//Global Debug Function
	global.__debug = function(msg, obj, stringify) {
		if (obj)
			console.log(
				"[debug] " + new Date().toGMTString() + " : " + msg + " => ",
				stringify ? JSON.stringify(obj) : obj
			);
		else console.log("[debug] " + new Date().toGMTString() + " : " + msg);
		return obj;
	};

	//Global Error Function
	global.__error = function(msg, obj) {
		var data;
		if (obj)
			console.log(
				"[error] " + new Date().toGMTString() + " : " + msg + " => ",
				obj.stack || JSON.stringify(obj)
			);
		else console.log("[error] " + new Date().toGMTString() + " : " + msg);
		return obj;
	};

	//Global Info Function
	global.__info = function(msg, obj, stringify) {
		if (obj)
			console.log(
				"[info] " + new Date().toGMTString() + " : " + msg + " => ",
				stringify ? JSON.stringify(obj) : obj
			);
		else console.log("[info] " + new Date().toGMTString() + " : " + msg);
		return obj;
	};
	//Global Security Function
	global.__security = function(ip, msg, obj, stringify) {
		if (obj)
			console.log(
				"[security] " +
					new Date().toGMTString() +
					" : " +
					ip +
					" : " +
					msg +
					" => ",
				stringify ? JSON.stringify(obj) : obj
			);
		else
			console.log(
				"[security] " + new Date().toGMTString() + " : " + ip + " : " + msg
			);
		return obj;
	};
} else {
	//Global Debug Function
	global.__debug = function(msg, obj, stringify) {
		if (obj)
			data =
				("[debug] " + new Date().toGMTString() + " : " + msg + " => ",
				stringify ? JSON.stringify(obj) : obj);
		else data = "[debug] " + new Date().toGMTString() + " : " + msg;
		fs.appendFileSync(
			__logPath +
				"/debug_" +
				new Date()
					.toISOString()
					.split(/[-:]/i)
					.slice(0, 3)
					.join("") +
				".log",
			data
		);
		return obj;
	};

	//Global Error Function
	global.__error = function(msg, obj) {
		if (obj)
			data =
				("[error] " + new Date().toGMTString() + " : " + msg + " => ",
				obj.stack || JSON.stringify(obj));
		else data = "[error] " + new Date().toGMTString() + " : " + msg;
		fs.appendFileSync(
			__logPath +
				"/error_" +
				new Date()
					.toISOString()
					.split(/[-:]/i)
					.slice(0, 3)
					.join("") +
				".log",
			data
		);
		return obj;
	};

	//Global Info Function
	global.__info = function(msg, obj, stringify) {
		if (obj)
			data =
				("[info] " + new Date().toGMTString() + " : " + msg + " => ",
				stringify ? JSON.stringify(obj) : obj);
		else data = "[info] " + new Date().toGMTString() + " : " + msg;
		fs.appendFileSync(
			__logPath +
				"/info_" +
				new Date()
					.toISOString()
					.split(/[-:]/i)
					.slice(0, 3)
					.join("") +
				".log",
			data
		);
		return obj;
	};

	//Global Security Function
	global.__security = function(ip, msg, obj, stringify) {
		if (obj)
			data =
				("[security] " +
					new Date().toGMTString() +
					" : " +
					ip +
					" : " +
					msg +
					" => ",
				stringify ? JSON.stringify(obj) : obj);
		else
			data =
				"[security] " + new Date().toGMTString() + " : " + ip + " : " + msg;
		fs.appendFileSync(
			__logPath +
				"/security_" +
				new Date()
					.toISOString()
					.split(/[-:]/i)
					.slice(0, 3)
					.join("") +
				".log",
			data
		);
		return obj;
	};
}


//Setting configuration defined in Config file
global.__email = config.email;

var emailSender = require("./email");

let sender = new emailSender(__email);
sender.initialize();

var i = 0;

/**
 * 
 * Mail body and Interval Details Here; Default from Config
 * 
 */

let sender_list = config.email_data.sender_list;

var head = config.email_data.head;

var subject = config.email_data.subject;

var body = config.email_data.body;

var interval = config.email_data.interval;

cron.job(interval, function () {
    __info(`Sending Email to ${sender_list[i]} [${i + 1}/${sender_list.length}]`);
    sender.compose(head, sender_list[i], subject, body, [], (err, res) => {
        if (err) {
            __info(`Failed for ${sender_list[i]} [${err}]`);
            fs.appendFileSync(
                "failed_" +
                new Date()
                    .toISOString()
                    .split(/[-:]/i)
                    .slice(0, 3)
                    .join("") +
                ".log",
                sender_list[i]
            );
        }
        else {
            __info(`Sent to ${sender_list[i]} [${res}]`);
		}
		i++;
		if(i>=sender_list.length){
			__info(`${i} e-mails sent. Program Exiting...`);
			process.exit(0);
		}
    });
}).start();


