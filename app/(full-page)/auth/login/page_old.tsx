/* eslint-disable @next/next/no-img-element */
"use client";
import { useRouter } from "next/navigation";
import React, { useContext, useEffect, useRef, useState } from "react";
import { Checkbox } from "primereact/checkbox";
import { Button } from "primereact/button";
import { Password } from "primereact/password";
import { LayoutContext } from "../../../../layout/context/layoutcontext";
import { InputText } from "primereact/inputtext";
import { classNames } from "primereact/utils";
import { useSession, signIn, signOut } from "next-auth/react";
import { Toast } from "primereact/toast";
import { useFormik } from "formik";
import * as Yup from "yup";
import { InventoryService } from "@/app/service/InventoryService";
import { useDispatch } from "react-redux";
import { setProfile } from "@/app/store/profile";
import useDeviceSize from "@/app/hooks/getWindowsDimension";
import Loading from "@/app/components/atoms/loading";

const LoginPage = () => {
  const toast = useRef<any>(null);
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { layoutConfig } = useContext(LayoutContext);

  const router = useRouter();
  const containerClassName = classNames(
    "surface-ground flex align-items-center justify-content-center min-h-screen min-w-screen overflow-hidden",
    { "p-input-filled": layoutConfig.inputStyle === "filled" }
  );
  const dispatch = useDispatch();
  const formik = useFormik<any>({
    initialValues: {
      email: "",
      password: "",
    },
    validationSchema: Yup.object({
      email: Yup.string().required("Required"),
      password: Yup.string().required("Required"),
    }),
    validateOnChange: false,
    enableReinitialize: true,
    onSubmit: (values) => {
      console.log("values :", values);
      onLogin(values);
    },
  });
  const [width] = useDeviceSize();

  const isMobile = width <= 768;
  const onLogin = async (payload: any) => {
    try {
      setIsLoading(true);
      console.log("payload :", payload);
      const response = await InventoryService.loginFetch(payload);
      if (response.success) {
        dispatch(
          setProfile({
            id: response?.data?.id,
            fullname: response?.data?.fullname,
            email: response?.data?.email,
            user_type: response?.data?.user_type,
          })
        );
        localStorage.setItem("auth", JSON.stringify(response.data));
        toast?.current?.show({
          severity: "success",
          summary: "Welcome",
          detail: "Login success",
          life: 3000,
        });
        setTimeout(() => {
          setIsLoading(false);
          router.push("/");
        }, 1000);
      } else {
        setIsLoading(false);
        toast?.current?.show({
          severity: "error",
          summary: "Error",
          detail: response.message,
          life: 3000,
        });
      }
    } catch (error: any) {
      setIsLoading(false);
      toast?.current?.show({
        severity: "error",
        summary: "Error",
        detail: error?.response.data.message,
        life: 3000,
      });
    }
  };
  console.log(formik.values);
  return (
    <div className={containerClassName}>
      {isLoading && <Loading />}
      <div className="flex flex-column align-items-center justify-content-center">
        <div
          style={{
            borderRadius: "56px",
            padding: "0.3rem",
            ...(isMobile && { width: width - 32 }),
            background:
              "linear-gradient(180deg, var(--primary-color) 10%, rgba(33, 150, 243, 0) 30%)",
          }}
        >
          <div
            className="w-full surface-card py-8 px-5 sm:px-8"
            style={{ borderRadius: "53px" }}
          >
            <div className="text-center mb-5">
              <div className="text-900 text-3xl font-medium mb-3">
                EMI Inventory
              </div>
              <span className="text-600 font-medium">Sign in to continue</span>
            </div>

            <div>
              <label
                htmlFor="email1"
                className="block text-900 text-xl font-medium mb-2"
              >
                Email
              </label>
              <InputText
                id="email1"
                type="text"
                value={formik.values.email}
                onChange={(e) => formik.setFieldValue("email", e.target.value)}
                placeholder="Email address"
                className={`w-full md:w-30rem mb-5 ${
                  formik.errors.email ? "border-red-600" : "border-gray-300"
                }`}
                style={{ padding: "1rem" }}
              />

              <label
                htmlFor="password1"
                className="block text-900 font-medium text-xl mb-2"
              >
                Password
              </label>
              <Password
                inputId="password1"
                value={formik.values.password}
                onChange={(e) =>
                  formik.setFieldValue("password", e.target.value)
                }
                feedback={false}
                toggleMask
                placeholder="Password"
                className="w-full mb-5"
                inputClassName={`w-full p-3 md:w-30rem ${
                  formik.errors.password ? "border-red-600" : "border-gray-300"
                }`}
              ></Password>

              <div className="flex align-items-center justify-content-between mb-5 gap-5">
                {/* <div className="flex align-items-center">
                  <Checkbox
                    inputId="rememberme1"
                    checked={checked}
                    onChange={(e) => setChecked(e.checked ?? false)}
                    className="mr-2"
                  ></Checkbox>
                  <label htmlFor="rememberme1">Remember me</label>
                </div> */}
                {/* <a
                  className="font-medium no-underline ml-2 text-right cursor-pointer"
                  style={{ color: "var(--primary-color)" }}
                >
                  Forgot password?
                </a> */}
              </div>
              <Button
                type="button"
                label="Sign In"
                disabled={!formik.values.email || !formik.values.password}
                className="w-full p-3 text-xl"
                onClick={() => formik.submitForm()}
              ></Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
