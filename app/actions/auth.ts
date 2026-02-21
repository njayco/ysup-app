"use server"

interface SignupData {
  college: string
  phone: string
  username: string
  password: string
  firstName: string
  lastName: string
  agreeTerms: boolean
}

// Simulated database - in a real app, this would be a proper database
const users: Array<SignupData & { id: string; createdAt: string }> = []

export async function signupUser(formData: FormData) {
  const signupData: SignupData = {
    college: formData.get("college") as string,
    phone: formData.get("phone") as string,
    username: formData.get("username") as string,
    password: formData.get("password") as string,
    firstName: formData.get("firstName") as string,
    lastName: formData.get("lastName") as string,
    agreeTerms: formData.get("agreeTerms") === "on",
  }

  // Validate required fields
  if (
    !signupData.phone ||
    !signupData.username ||
    !signupData.password ||
    !signupData.firstName ||
    !signupData.lastName
  ) {
    throw new Error("All fields are required")
  }

  // Validate username length
  if (signupData.username.length < 4) {
    throw new Error("Username must be at least 4 characters long")
  }

  if (!signupData.agreeTerms) {
    throw new Error("You must agree to the Terms & Conditions")
  }

  // Check if user already exists (by phone or username)
  const existingUser = users.find((user) => user.phone === signupData.phone || user.username === signupData.username)
  if (existingUser) {
    if (existingUser.phone === signupData.phone) {
      throw new Error("User with this phone number already exists")
    } else {
      throw new Error("Username is already taken")
    }
  }

  // Save user to "database"
  const newUser = {
    ...signupData,
    id: Date.now().toString(),
    createdAt: new Date().toISOString(),
  }

  users.push(newUser)

  console.log("New user registered:", {
    id: newUser.id,
    phone: newUser.phone,
    username: newUser.username,
    firstName: newUser.firstName,
    lastName: newUser.lastName,
    college: newUser.college,
    createdAt: newUser.createdAt,
  })

  // Return success response instead of redirecting
  return {
    success: true,
    user: {
      id: newUser.id,
      phone: newUser.phone,
      username: newUser.username,
      firstName: newUser.firstName,
      lastName: newUser.lastName,
      college: newUser.college,
    },
  }
}

export async function loginUser(formData: FormData) {
  const phone = formData.get("phone") as string
  const username = formData.get("username") as string
  const password = formData.get("password") as string

  // Find user in "database" by phone or username
  const user = users.find((u) => (u.phone === phone || u.username === username) && u.password === password)

  if (!user) {
    throw new Error("Invalid credentials")
  }

  console.log("User logged in:", {
    id: user.id,
    phone: user.phone,
    username: user.username,
    firstName: user.firstName,
    lastName: user.lastName,
  })

  // Return success response instead of redirecting
  return {
    success: true,
    user: {
      id: user.id,
      phone: user.phone,
      username: user.username,
      firstName: user.firstName,
      lastName: user.lastName,
      college: user.college,
    },
  }
}

// Helper function to get all users (for admin purposes)
export async function getAllUsers() {
  return users.map((user) => ({
    id: user.id,
    phone: user.phone,
    username: user.username,
    firstName: user.firstName,
    lastName: user.lastName,
    college: user.college,
    createdAt: user.createdAt,
  }))
}
