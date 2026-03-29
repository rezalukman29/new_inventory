"use client";

import { useRouter } from "next/navigation";
import React, { useContext, useEffect, useRef, useState } from "react";
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

const styles: Record<string, React.CSSProperties> = {
  page: {
    minHeight: "100vh",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    background:
      "linear-gradient(135deg, #e8eaf6 0%, #ede7f6 50%, #e3f2fd 100%)",
    padding: "16px",
    fontFamily: "'Segoe UI', sans-serif",
  },
  card: {
    width: "100%",
    maxWidth: "380px",
    borderRadius: "20px",
    overflow: "hidden",
    boxShadow: "0 20px 60px rgba(99, 102, 241, 0.2)",
  },
  header: {
    position: "relative",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    padding: "40px 32px",
    background:
      "linear-gradient(135deg, #6366f1 0%, #8b5cf6 50%, #a855f7 100%)",
    overflow: "hidden",
  },
  decorCircle1: {
    position: "absolute",
    top: "-32px",
    right: "-32px",
    width: "120px",
    height: "120px",
    borderRadius: "50%",
    background: "rgba(255,255,255,0.1)",
  },
  decorCircle2: {
    position: "absolute",
    bottom: "-24px",
    left: "-24px",
    width: "96px",
    height: "96px",
    borderRadius: "50%",
    background: "rgba(255,255,255,0.1)",
  },
  iconWrapper: {
    position: "relative",
    zIndex: 1,
    width: "64px",
    height: "64px",
    borderRadius: "50%",
    background: "rgba(255,255,255,0.2)",
    backdropFilter: "blur(8px)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: "20px",
    border: "2px solid rgba(255,255,255,0.3)",
  },
  headerTitle: {
    position: "relative",
    zIndex: 1,
    fontSize: "22px",
    fontWeight: "700",
    color: "#fff",
    margin: "0 0 4px 0",
  },
  headerSubtitle: {
    position: "relative",
    zIndex: 1,
    fontSize: "13px",
    color: "rgba(255,255,255,0.75)",
    margin: 0,
  },
  formSection: {
    background: "#fff",
    padding: "32px",
  },
  fieldGroup: {
    marginBottom: "20px",
  },
  label: {
    display: "block",
    fontSize: "13px",
    fontWeight: "600",
    color: "#374151",
    marginBottom: "8px",
  },
  inputWrapper: {
    position: "relative",
  },
  inputIcon: {
    position: "absolute",
    left: "12px",
    top: "50%",
    transform: "translateY(-50%)",
    color: "#9ca3af",
    display: "flex",
    alignItems: "center",
    pointerEvents: "none",
  },
  input: {
    width: "100%",
    padding: "12px 12px 12px 36px",
    fontSize: "13px",
    border: "1px solid #e5e7eb",
    borderRadius: "12px",
    background: "#f9fafb",
    color: "#1f2937",
    outline: "none",
    boxSizing: "border-box",
    transition: "border-color 0.2s, box-shadow 0.2s",
  },
  inputFocused: {
    borderColor: "#6366f1",
    boxShadow: "0 0 0 3px rgba(99,102,241,0.12)",
    background: "#fff",
  },
  eyeButton: {
    position: "absolute",
    right: "12px",
    top: "50%",
    transform: "translateY(-50%)",
    background: "none",
    border: "none",
    cursor: "pointer",
    color: "#9ca3af",
    display: "flex",
    alignItems: "center",
    padding: 0,
  },
  row: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: "24px",
  },
  checkboxLabel: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    cursor: "pointer",
    userSelect: "none",
  },
  checkboxText: {
    fontSize: "13px",
    color: "#6b7280",
  },
  forgotLink: {
    background: "none",
    border: "none",
    cursor: "pointer",
    fontSize: "13px",
    fontWeight: "600",
    color: "#6366f1",
    padding: 0,
  },
  signInBtn: {
    width: "100%",
    padding: "13px",
    borderRadius: "12px",
    border: "none",
    cursor: "pointer",
    fontSize: "14px",
    fontWeight: "700",
    color: "#fff",
    background: "linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)",
    boxShadow: "0 4px 15px rgba(99,102,241,0.4)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "8px",
    transition: "opacity 0.2s",
  },
  signInBtnLoading: {
    background: "#a5b4fc",
    boxShadow: "none",
    cursor: "not-allowed",
  },
  footer: {
    background: "#f9fafb",
    borderTop: "1px solid #f3f4f6",
    padding: "16px 32px",
    textAlign: "center",
  },
  footerText: {
    fontSize: "13px",
    color: "#6b7280",
    margin: 0,
  },
  signUpLink: {
    background: "none",
    border: "none",
    cursor: "pointer",
    fontSize: "13px",
    fontWeight: "700",
    color: "#6366f1",
    padding: 0,
  },
  copyright: {
    marginTop: "20px",
    fontSize: "11px",
    color: "#9ca3af",
  },
};

const spinKeyframes = `
  @keyframes spin {
    from { transform: rotate(0deg); }
    to { transform: rotate(360deg); }
  }
`;

export default function LoginPage() {
  const toast = useRef<any>(null);
  const dispatch = useDispatch();
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

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
      onLogin(values);
    },
  });

  const onLogin = async (payload: any) => {
    try {
      setIsLoading(true);
      const response = await InventoryService.postLogin(payload);
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

  const [showPassword, setShowPassword] = useState(false);
  const [remember, setRemember] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [emailFocus, setEmailFocus] = useState(false);
  const [passFocus, setPassFocus] = useState(false);

  const handleSubmit = () => formik.submitForm()

  const checkboxBoxStyle = {
    width: "16px",
    height: "16px",
    borderRadius: "4px",
    border: remember ? "none" : "1.5px solid #d1d5db",
    background: remember ? "#6366f1" : "#fff",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
    transition: "all 0.2s",
  };

  return (
    <div style={styles.page}>
      <style>{spinKeyframes}</style>

      <div style={styles.card}>
        {/* Header */}
        <div style={styles.header}>
          <div style={styles.decorCircle1} />
          <div style={styles.decorCircle2} />

          <div style={styles.iconWrapper}>
            <svg
              width="28"
              height="28"
              fill="none"
              viewBox="0 0 24 24"
              stroke="white"
              strokeWidth="1.8"
            >
              <rect
                x="2"
                y="5"
                width="20"
                height="14"
                rx="2"
                stroke="white"
                strokeWidth="1.8"
                fill="none"
              />
              <path d="M2 10h20" stroke="white" strokeWidth="1.8" />
              <path
                d="M6 15h4M14 15h4"
                stroke="white"
                strokeWidth="1.8"
                strokeLinecap="round"
              />
            </svg>
          </div>

          <h1 style={styles.headerTitle}>Welcome Back</h1>
          <p style={styles.headerSubtitle}>Sign in to EMI Inventory</p>
        </div>

        {/* Form */}
        <div style={styles.formSection}>
          {/* Email */}
          <div style={styles.fieldGroup}>
            <label style={styles.label}>Email Address</label>
            <div style={styles.inputWrapper}>
              <span style={styles.inputIcon}>
                <svg
                  width="16"
                  height="16"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                  />
                </svg>
              </span>
              <input
                type="email"
                value={formik.values.email}
                onChange={(e) => formik.setFieldValue("email", e.target.value)}
                onFocus={() => setEmailFocus(true)}
                onBlur={() => setEmailFocus(false)}
                placeholder="Enter your email"
                style={{
                  ...styles.input,
                  ...(emailFocus ? styles.inputFocused : {}),
                }}
              />
            </div>
          </div>

          {/* Password */}
          <div style={styles.fieldGroup}>
            <label style={styles.label}>Password</label>
            <div style={styles.inputWrapper}>
              <span style={styles.inputIcon}>
                <svg
                  width="16"
                  height="16"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                  />
                </svg>
              </span>
              <input
                type={showPassword ? "text" : "password"}
                value={formik.values.password}
                onFocus={() => setPassFocus(true)}
                onBlur={() => setPassFocus(false)}
                onChange={(e) =>
                  formik.setFieldValue("password", e.target.value)
                }
                placeholder="Enter your password"
                style={{
                  ...styles.input,
                  paddingRight: "40px",
                  ...(passFocus ? styles.inputFocused : {}),
                }}
              />
              <button
                onClick={() => setShowPassword(!showPassword)}
                style={styles.eyeButton}
              >
                {showPassword ? (
                  <svg
                    width="16"
                    height="16"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"
                    />
                  </svg>
                ) : (
                  <svg
                    width="16"
                    height="16"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                    />
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                    />
                  </svg>
                )}
              </button>
            </div>
          </div>

          {/* Remember & Forgot */}
          <div style={styles.row}>
            <label
              style={styles.checkboxLabel}
              onClick={() => setRemember(!remember)}
            >
              <div style={checkboxBoxStyle}>
                {remember && (
                  <svg
                    width="10"
                    height="10"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="white"
                    strokeWidth="3"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                )}
              </div>
              <span style={styles.checkboxText}>Remember me</span>
            </label>
            <button style={styles.forgotLink}>Forgot password?</button>
          </div>

          {/* Sign In Button */}
          <button
            onClick={handleSubmit}
            disabled={isLoading}
            style={{
              ...styles.signInBtn,
              ...(isLoading ? styles.signInBtnLoading : {}),
            }}
          >
            {isLoading ? (
              <>
                <svg
                  width="16"
                  height="16"
                  fill="none"
                  viewBox="0 0 24 24"
                  style={{ animation: "spin 0.8s linear infinite" }}
                >
                  <circle
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="white"
                    strokeWidth="4"
                    strokeOpacity="0.25"
                  />
                  <path fill="white" d="M4 12a8 8 0 018-8v8H4z" />
                </svg>
                Signing in...
              </>
            ) : (
              "Sign In"
            )}
          </button>
        </div>

        {/* Footer */}
        <div style={styles.footer}>
          <p style={styles.footerText}>
            Don't have an account?{" "}
            <button style={styles.signUpLink}>Sign up</button>
          </p>
        </div>
      </div>

      <p style={styles.copyright}>© 2026 EMI Inventory. All rights reserved.</p>
    </div>
  );
}
