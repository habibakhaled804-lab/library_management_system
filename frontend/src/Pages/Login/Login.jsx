import { useContext, useEffect, useState } from "react";
import { tokenContext } from "../../Context/TokenContext"; 
import { useFormik } from "formik";
import { Link, useNavigate } from "react-router-dom";
import { LuLoader } from "react-icons/lu";
import { loginUser } from "../../api/client";

export default function Login() {
  const { login } = useContext(tokenContext); 
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState(null);

  const initialValues = { email: "", password: "" };

  async function handleLogin(values) {
    setIsLoading(true);
    setErrorMsg(null);
    try {
      const data = await loginUser(values.email, values.password);
      const token = data?.id ? String(data.id) : "token";
      login(token, data);
      navigate("/");
    } catch (err) {
      const message = err?.response?.data?.error || "Login failed. Please try again.";
      setErrorMsg(message);
    } finally {
      setIsLoading(false);
    }
  }

  function validateData(values) {
    let errors = {};
    const emailRegex = /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/;

    if (!values.email) errors.email = "Email is required";
    else if (!emailRegex.test(values.email)) errors.email = "Invalid email";

    if (!values.password) errors.password = "Password is required";

    return errors;
  }

  const formik = useFormik({
    initialValues,
    validate: validateData,
    onSubmit: handleLogin,
  });
  useEffect(() => {
      document.title = "Login";
    }, []);

  return (
    <div className="flex justify-center items-center">
      <section className="dark:bg-gray-900 w-full md:w-3/4 lg:w-1/2 bg-gray-50 p-3">
        <h1 className="text-3xl font-bold my-3 text-blue-700">Login Now:</h1>
        {errorMsg && <div className="bg-red-400 rounded-md my-2 p-3 text-center text-white">{errorMsg}</div>}
        <form onSubmit={formik.handleSubmit}>
          <div className="mb-5">
            <label className="block mb-2 text-sm font-medium text-blue-700 dark:text-white">
              Your email
            </label>
            <input
              type="email"
              name="email"
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              value={formik.values.email}
              className="bg-gray-50 border border-gray-300 rounded-lg p-2.5 w-full focus:outline-none focus:border-blue-600"
              placeholder="Enter your email"
            />
            {formik.touched.email && formik.errors.email && (
              <small className="text-red-600">{formik.errors.email}</small>
            )}
          </div>

          <div className="mb-5">
            <label className="block mb-2 text-sm font-medium text-blue-700 dark:text-white">
              Your password
            </label>
            <input
              type="password"
              name="password"
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              value={formik.values.password}
              className="bg-gray-50 border border-gray-300 rounded-lg p-2.5 w-full focus:outline-none focus:border-blue-600"
              placeholder="Enter your password"
            />
            {formik.touched.password && formik.errors.password && (
              <small className="text-red-600">{formik.errors.password}</small>
            )}
              <div className="flex flex-col mt-2 sm:flex-row justify-between gap-2 sm:gap-0">
              <small>
                Create new Account{" "}
                <Link
                  to="/register"
                  className="text-blue-400 font-bold hover:text-blue-700"
                >
                  Register
                </Link>
              </small>
              <small>
                <Link
                  to="/forgetPassword"
                  className="text-blue-400 font-bold hover:text-blue-700"
                >
                  Forget a Password?
                </Link>
              </small>
            </div>
          </div>
            {isLoading ? (
              <button disabled className="text-white  bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 me-2 mb-2 dark:bg-blue-600 dark:hover:bg-blue-700 focus:outline-none dark:focus:ring-blue-800" ><LuLoader /></button>
            ) : (
              <button type="submit" className="text-white bg-blue-700 disabled:bg-blue-300 hover:bg-blue-800 focus:ring-4 focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 me-2 mb-2 dark:bg-blue-600 dark:hover:bg-blue-700 focus:outline-none dark:focus:ring-blue-800" disabled={!(formik.isValid && formik.dirty)} >Login</button>
            )}
          </form>
        </section>
      </div>

  );
}
