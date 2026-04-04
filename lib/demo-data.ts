import type {
  LoginFormData,
  ResetPasswordFormData,
  SignupFormData,
} from "@/lib/validations/auth"

export const DEMO_LOGIN_CREDENTIALS: LoginFormData = {
  email: "admin@subsms.local",
  password: "Admin@1234!",
}

export const DEMO_RESET_PASSWORD_DATA: ResetPasswordFormData = {
  email: DEMO_LOGIN_CREDENTIALS.email,
}

export function getDemoSignupData(): SignupFormData {
  const password = "Portal@1234!"
  const uniqueSuffix = Date.now()

  return {
    name: "Alex Johnson",
    email: `alex.demo.${uniqueSuffix}@subsms.local`,
    password,
    confirmPassword: password,
  }
}

export const DEMO_CHECKOUT_DETAILS = {
  fullName: "Aarav Sharma",
  email: "aarav.sharma@subsms.local",
  company: "NovaStack Systems",
  phone: "+91 98765 43210",
  address: "221B Residency Road",
  city: "Bengaluru",
  state: "Karnataka",
  pincode: "560001",
}

export const DEMO_PAYMENT_DETAILS = {
  cardNumber: "4242 4242 4242 4242",
  expiry: "12/30",
  cvv: "123",
}
