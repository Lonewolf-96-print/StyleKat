import React, { useState } from "react";
import { Home } from "../../UserPages/Home";
import { useApp } from "../../contexts/AppContext";
import toast from "react-hot-toast";
import { DashboardHeader } from "../../components-barber/header";
import { useLanguage } from "../../components-barber/language-provider";

const Login = () => {
  const { currentUser, setCurrentUser, isFormOpen, setIsFormOpen } = useApp();
  const { t } = useLanguage();
  const [state, setState] = useState("login");

  const handleSubmit = (e) => {
    e.preventDefault();

    if (state === "register") {
      toast.success(t("auth.accountCreated"));
    } else {
      toast.success(t("auth.loggedIn"));
    }

    console.log("Form submitted:", currentUser);
    setIsFormOpen(false); // close modal after submit
  };

  return (
    <>
      {/* Home gets blurred when form is open */}
      <div className={`${isFormOpen ? "blur-sm" : ""}`}>
        <Home />
        <DashboardHeader />
      </div>

      {/* Overlay + form */}
      {isFormOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40"
          onClick={() => setIsFormOpen(false)} // close when clicking outside
        >
          <form
            onSubmit={handleSubmit}
            className="flex flex-col gap-4 items-start p-8 py-12 w-80 sm:w-[352px] text-gray-500 rounded-lg shadow-xl border border-gray-200 bg-white relative z-50"
            onClick={(e) => e.stopPropagation()} // prevent closing when clicking inside
          >
            <p className="text-2xl font-medium m-auto">
              <span className="text-indigo-500">{t("auth.user")}</span>{" "}
              {state === "login" ? t("auth.login") : t("auth.signUp")}
            </p>

            {state === "register" && (
              <div className="w-full">
                <p>{t("auth.name")}</p>
                <input
                  type="text"
                  value={currentUser.name}
                  onChange={(e) => setCurrentUser({ ...currentUser, name: e.target.value })}
                  placeholder={t("auth.namePlaceholder")}
                  className="border border-gray-200 rounded w-full p-2 mt-1 outline-indigo-500"
                  required
                />
              </div>
            )}

            <div className="w-full">
              <p>{t("auth.email")}</p>
              <input
                type="email"
                value={currentUser.email}
                onChange={(e) => setCurrentUser({ ...currentUser, email: e.target.value })}
                placeholder={t("auth.emailPlaceholder")}
                className="border border-gray-200 rounded w-full p-2 mt-1 outline-indigo-500"
                required
              />
            </div>

            <div className="w-full">
              <p>{t("auth.password")}</p>
              <input
                type="password"
                value={currentUser.password}
                onChange={(e) => setCurrentUser({ ...currentUser, password: e.target.value })}
                placeholder={t("auth.passwordPlaceholder")}
                className="border border-gray-200 rounded w-full p-2 mt-1 outline-indigo-500"
                required
              />
            </div>

            <div className="w-full">
              <p>{t("auth.roleQuestion")}</p>
              <input
                type="text"
                value={currentUser.role}
                onChange={(e) => setCurrentUser({ ...currentUser, role: e.target.value })}
                placeholder={t("auth.rolePlaceholder")}
                className="border border-gray-200 rounded w-full p-2 mt-1 outline-indigo-500"
                required
              />
            </div>

            {state === "register" ? (
              <p>
                {t("auth.alreadyHaveAccount")}{" "}
                <span
                  onClick={() => setState("login")}
                  className="text-indigo-500 cursor-pointer"
                >
                  {t("auth.clickHere")}
                </span>
              </p>
            ) : (
              <p>
                {t("auth.createAccountQuestion")}{" "}
                <span
                  onClick={() => setState("register")}
                  className="text-indigo-500 cursor-pointer"
                >
                  {t("auth.clickHere")}
                </span>
              </p>
            )}

            <button
              type="submit"
              className="bg-indigo-500 hover:bg-indigo-600 transition-all text-white w-full py-2 rounded-md cursor-pointer"
            >
              {state === "register" ? t("auth.signUp") : t("auth.login")}
            </button>
          </form>
        </div>
      )}
    </>
  );
};

export default Login;
