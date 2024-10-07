import { login,  verifyotp} from './actions'

export default function LoginPage() {
  return (
    <form>
      <label htmlFor="email">Email:</label>
      <input id="email" name="email" type="email" required />
      <label htmlFor="password">OTP:</label>
      <input id="otp" name="otp" />
      <button formAction={login}>Log in</button>
      <button formAction={verifyotp}>verify otp</button>

      {/* <button formAction={signup}>Sign up</button> */}
    </form>
  )
}