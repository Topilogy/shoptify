import { useState } from "react";
import { signupUser } from "../services/api";

const Signup = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

    const handleSignup = async (e) => {
        e.preventDefault();

        if (password !== confirmPassword) {
            alert("Passwords do not match");
            return;
        }

        try {
            const { data } = await signupUser({ name, email, password });

            localStorage.setItem("token", data.token);
            localStorage.setItem("user", JSON.stringify(data.user));

            window.location.href = "/";
        } catch (err) {
            alert(err.response?.data?.message || "Signup failed");
        }
    };

  return (
    <div className="bg-white p-8 rounded-xl shadow-2xl w-full max-w-md">
       <h2 className="text-2xl font-bold mb-6 text-center">Signup</h2> 
      <form
        onSubmit={handleSignup}
        className="bg-white p-8 rounded w-full max-w-md"
      >
        

        <label className="block mb-2 font-semibold">Full Name</label>
        <input
          type="text"
          className="w-full p-2 mb-4 border border-gray-300 rounded"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />

        <label className="block mb-2 font-semibold">Email</label>
        <input
          type="email"
          className="w-full p-2 mb-4 border border-gray-300 rounded"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />

        <label className="block mb-2 font-semibold">Password</label>
        <input
          type="password"
          className="w-full p-2 mb-4 border border-gray-300 rounded"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />

        <label className="block mb-2 font-semibold">Confirm Password</label>
        <input
          type="password"
          className="w-full p-2 mb-4 border border-gray-300 rounded"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          required
        />

        <button
          type="submit"
          className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700"
        >
          Signup
        </button>

        <p className="text-sm text-gray-500 mt-4 text-center">
          Already have an account?{" "}
          <a href="/login" className="text-blue-600 hover:underline">
            Login
          </a>
        </p>
      </form>
      
    </div>
  );
};

export default Signup;