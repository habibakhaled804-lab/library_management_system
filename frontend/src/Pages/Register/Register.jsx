import { useFormik } from 'formik';
import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { LuLoader } from 'react-icons/lu';
import { registerUser } from '../../api/client';

export default function Register() {
  const [errorMsg, setErrorMsg] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const initialValues = {
    name: "",
    email: "",
    password: "",
    rePassword: "",
    role: "",
  };

  async function handleRegister(values) {
    setIsLoading(true);
    setErrorMsg(null);

    try {
      await registerUser({
        name: values.name,
        email: values.email,
        password: values.password,
      });
      navigate("/login");
    } catch (err) {
      const message = err?.response?.data?.error || "Registration failed. Please try again.";
      setErrorMsg(message);
    } finally {
      setIsLoading(false);
    }
  }

  function validateData(data) {
    let errors = {};
    const nameRegex = /^[A-Z][a-zA-Z '.-]*[A-Za-z][^-]$/;
    const emailRegex = /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/;
    const passwordRegex = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[a-zA-Z]).{8,}$/;

    if (!data.name) {
      errors.name = "Name is required";
    } else if (!nameRegex.test(data.name)) {
      errors.name = "Name must start with capital letter";
    }

    if (!data.email) {
      errors.email = "Email is required";
    } else if (!emailRegex.test(data.email)) {
      errors.email = "Email is not valid";
    }

    if (!data.password) {
      errors.password = "Password is required";
    } else if (!passwordRegex.test(data.password)) {
      errors.password = "Password must contain at least 8 characters, one uppercase, one lowercase, and one number.";
    }

    if (!data.rePassword) {
      errors.rePassword = "rePassword is required";
    } else if (data.rePassword !== data.password) {
      errors.rePassword = "rePassword does not match Password";
    }

    return errors;
  }

  const formik = useFormik({
    initialValues,
    validate: validateData,
    onSubmit: handleRegister
  });

  useEffect(() => {
    document.title = "Register";
  }, []);

  return (
    <>
      <div className='flex justify-center items-center'>
        <section className=" dark:bg-gray-900 w-full md:w-3/4 lg:w-1/2 bg-gray-50 p-3 ">
          <h1 className='text-3xl font-bold my-3 text-blue-700'>Register Now:</h1>
          {errorMsg && (<div className='bg-red-400 rounded-md my-2 p-3 text-center text-white'>{errorMsg}</div>)}
          <form onSubmit={formik.handleSubmit}>
            <div className='mb-5'>
              <label htmlFor="name" className="block mb-2 text-sm font-medium text-blue-700 dark:text-white">Your name</label>
              <input onChange={formik.handleChange} type="text" name="name" id="name" className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:border-blue-500 dark:focus:ring-blue-500" placeholder="Enter Your Name" value={formik.values.name} onBlur={formik.handleBlur} />
              {formik.touched.name && formik.errors.name && (<small className='text-red-600'>{formik.errors.name}</small>)}
            </div>
            <div className='mb-5'>
              <label htmlFor="email" className="block mb-2 text-sm font-medium text-blue-700 dark:text-white">Your email</label>
              <input onChange={formik.handleChange} type="email" name="email" id="email" className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:border-blue-500 dark:focus:ring-blue-500" placeholder="Enter your email" value={formik.values.email} onBlur={formik.handleBlur} />
              {formik.touched.email && formik.errors.email && (<small className='text-red-600'>{formik.errors.email}</small>)}
            </div>
            <div className='mb-5'>
              <label htmlFor="password" className="block mb-2 text-sm font-medium text-blue-700 dark:text-white">Your password</label>
              <input onChange={formik.handleChange} type="password" name="password" id="password" className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:border-blue-500 dark:focus:ring-blue-500" placeholder="Enter Your Password" value={formik.values.password} onBlur={formik.handleBlur} />
              {formik.touched.password && formik.errors.password && (<small className='text-red-600'>{formik.errors.password}</small>)}
            </div>
            <div className='mb-5'>
              <label htmlFor="rePassword" className="block mb-2 text-sm font-medium text-blue-700 dark:text-white">Your rePassword</label>
              <input onChange={formik.handleChange} type="password" name="rePassword" id="rePassword" className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:border-blue-500 dark:focus:ring-blue-500" placeholder="Enter Your rePassword" value={formik.values.rePassword} onBlur={formik.handleBlur} />
              {formik.touched.rePassword && formik.errors.rePassword && (<small className='text-red-600'>{formik.errors.rePassword}</small>)}
            </div>
            <div className='mb-5'>
              <label htmlFor="role" className="block mb-2 text-sm font-medium text-blue-700 dark:text-white">
                Select your role
              </label>

              <select name="role" id="role" value={formik.values.role} onChange={formik.handleChange} onBlur={formik.handleBlur} className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:text-white">
                <option value="">Choose Role</option>
                <option value="user">User</option>
                <option value="admin">Admin</option>
              </select>

              {formik.touched.role && formik.errors.role && (
                <small className="text-red-600">{formik.errors.role}</small>
              )}
            </div>

            {isLoading ? (
              <button disabled className="text-white bg-blue-700 hover:bg-blue-700 focus:ring-4  focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 me-2 mb-2  focus:outline-none " ><LuLoader /></button>
            ) : (
              <button type="submit" className="text-white bg-blue-700 disabled:bg-blue-300 hover:bg-blue-700 focus:ring-4 focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 me-2 mb-2   focus:outline-none " disabled={!(formik.isValid && formik.dirty)}>Register</button>
            )}
            <small>Already have account <Link to={'/login'} className='text-blue-400 hover:text-blue-700 font-bold' >Login</Link></small>

          </form>
        </section>
      </div>
    </>

  );
}
