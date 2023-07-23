import { freshTestWrapper } from "./wrapper.js";
import { assertEquals } from "$std/assert/assert_equals.ts";
import { assert } from "$std/assert/assert.ts";
import { Status } from "$std/http/http_status.ts";
import { wrapFetch } from "cookiejar";

const fetch = wrapFetch();

const BASE_URL = "http://localhost:8000";

Deno.env.set("APP_KEY", "something_for_testing");

Deno.test(
  "Public Pages Testing",
  {
    sanitizeResources: false,
    sanitizeOps: false,
  },
  freshTestWrapper(async (t) => {
    await t.step("The index page should work", async () => {
      const response = await fetch(`${BASE_URL}`);
      assertEquals(response.status, Status.OK);
      const text = await response.text();
      assert(!text.includes("<div>Flashed message: test</div>"));
    });

    await t.step("Post index page with 'email' form data.", async () => {
      const form_data = new FormData();
      form_data.append("email", "taylor@example.com");
      const response = await fetch(`${BASE_URL}`, {
        method: "POST",
        body: form_data,
        credentials: "include",
      });
      const text = await response.text();
      assert(
        text.includes(
          "<div>Flashed message: Successfully &quot;logged in&quot;</div>",
        ),
      );
      assertEquals(response.status, Status.OK);
    });

    await t.step("The dashboard should work", async () => {
      const response = await fetch(`${BASE_URL}/dashboard`);
      assertEquals(response.status, Status.OK);
    });

    await t.step("The other route should work", async () => {
      const response = await fetch(`${BASE_URL}/other-route`, {
        method: "POST",
      });
      const text = await response.text();
      // console.log(text);
      assert(
        text.includes(
          "<div>Flashed message: test</div>",
        ),
      );
      assert(
        text.includes(
          "<div>Flashed message: [{&quot;msg&quot;:&quot;test 2&quot;}]</div>",
        ),
      );
      assertEquals(response.status, Status.OK);
    });

    await t.step("The 404 page should 404", async () => {
      const response = await fetch(`${BASE_URL}/404`);
      assertEquals(response.status, Status.NotFound);
    });

    // More steps?
  }),
);
