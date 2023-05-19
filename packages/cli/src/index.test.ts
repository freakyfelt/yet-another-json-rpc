import assert from "node:assert";
import test from "node:test";

test("cli", (t) => {
	t.test("should be equal", () => {
		assert.strictEqual("cli", "cli");
	});
});
