import { useState } from "react";
import { changePassword } from "../services/api";

const ChangePassword = () => {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      await changePassword({
        currentPassword,
        newPassword,
      });

      alert("Password changed successfully");
    } catch (err) {
      alert(err.response?.data?.message || "Error");
    }
  };

  return (
    <div className="p-8 max-w-md mx-auto bg-white shadow rounded">
      <h2 className="text-xl font-bold mb-4">Change Password</h2>

      <form onSubmit={handleSubmit}>
        <input
          type="password"
          placeholder="Current Password"
          className="w-full p-2 mb-3 border"
          value={currentPassword}
          onChange={(e) => setCurrentPassword(e.target.value)}
        />

        <input
          type="password"
          placeholder="New Password"
          className="w-full p-2 mb-3 border"
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
        />

        <button className="w-full bg-blue-600 text-white py-2 rounded">
          Update Password
        </button>
      </form>
    </div>
  );
};

export default ChangePassword;