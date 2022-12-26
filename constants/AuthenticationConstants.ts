const constants = {
	acceptableRegularUsername: /^([A-Z]|[0-9]){5,30}$/,
	acceptableInstagramUsername: /^@[a-z0-9._]{1,30}$/,
    acceptablePassword:/^.{10,200}$/,
    acceptableVerificationCode:/^[0-9]{6,6}$/
};

export default constants;