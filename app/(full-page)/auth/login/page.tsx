/* eslint-disable @next/next/no-img-element */
"use client";
import { useRouter } from "next/navigation";
import React, { useContext, useRef, useState } from "react";
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

const LoginPage = () => {
  const toast = useRef<any>(null);
  const [password, setPassword] = useState("");
  const [checked, setChecked] = useState(false);
  const { layoutConfig } = useContext(LayoutContext);
  const router = useRouter();
  //   const { data, status } = useSession();

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
    onSubmit: (values) => onLogin(values),
  });

  const onLogin = async (payload: any) => {
    try {
      const response = await InventoryService.loginFetch(payload);
      if (response.success) {
        localStorage.setItem("auth", JSON.stringify(response.data));
        toast?.current?.show({
          severity: "success",
          summary: "Welcome",
          detail: "Login success",
          life: 3000,
        });
        setTimeout(() => {
          router.push("/");
        }, 1000);
      }
      toast?.current?.show({
        severity: "error",
        summary: "Error",
        detail: response.message,
        life: 3000,
      });
    } catch (error: any) {
      toast?.current?.show({
        severity: "error",
        summary: "Error",
        detail: error?.response.data.message,
        life: 3000,
      });
    }
  };

  const containerClassName = classNames(
    "surface-ground flex align-items-center justify-content-center min-h-screen min-w-screen overflow-hidden",
    { "p-input-filled": layoutConfig.inputStyle === "filled" }
  );

  return (
    <div className={containerClassName}>
      <div className="flex flex-column align-items-center justify-content-center">
        <Toast ref={toast} />
        <div
          style={{
            borderRadius: "56px",
            padding: "0.3rem",
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
                EMI INVENTORY
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
                placeholder="Password"
                toggleMask
                className="w-full mb-5"
                inputClassName={`w-full p-3 md:w-30rem ${
                  formik.errors.password ? "border-red-600" : "border-gray-300"
                }`}
              ></Password>

              <div className="flex align-items-center justify-content-between mb-1 gap-5">
                <div className="flex align-items-center"></div>
                <a
                  className="font-medium no-underline ml-2 text-right cursor-pointer"
                  style={{ color: "var(--primary-color)" }}
                ></a>
              </div>
              <Button
                label="Sign In"
                className="w-full p-3 text-xl"
                onClick={() => formik.handleSubmit()}
              ></Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
