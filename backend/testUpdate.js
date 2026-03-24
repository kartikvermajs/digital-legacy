import fetch from "node-fetch";

async function test() {
  console.log("Testing update...");
  try {
    // Attempt to signup first to get a token
    const signupRes = await fetch("http://127.0.0.1:3001/api/auth/signup", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: "testupdate@test.com", password: "pass", name: "test", phone: "123" })
    });
    
    let token = "";
    if (signupRes.status === 400) {
      // maybe already exists, try login
      const loginRes = await fetch("http://127.0.0.1:3001/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: "testupdate@test.com", password: "pass" })
      });
      const data = await loginRes.json();
      token = data.token;
    } else {
      const data = await signupRes.json();
      token = data.token;
    }

    if (!token) throw new Error("No token");

    const updateRes = await fetch("http://127.0.0.1:3001/api/user/update", {
      method: "PUT",
      headers: { 
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}` 
      },
      body: JSON.stringify({ name: "Updated Name", birthday: "2000-01-01", gender: "Male", avatarUrl: "" })
    });

    const updateData = await updateRes.text();
    console.log("Update status:", updateRes.status);
    console.log("Update response:", updateData);
  } catch (e) {
    console.error(e);
  }
}

test();
