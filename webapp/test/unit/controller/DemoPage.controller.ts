/*global QUnit*/
import Controller from "mobxui5demo/controller/Demo.controller";

QUnit.module("Demo Controller");

QUnit.test("I should test the Demo controller", function (assert: Assert) {
	const oAppController = new Controller("Demo");
	oAppController.onInit();
	assert.ok(oAppController);
});