(() => {
  "use strict";

  // ==========================================
  // 1. CONFIGURATION
  // ==========================================

  const SUPABASE_URL =
    "https://tmcnzlszfwnwrkqjfhdh.supabase.co";

  const SUPABASE_PUBLISHABLE_KEY =
    "sb_publishable_JhQUQTJcQiKwhlqQfnCofw_d0miJl2f";

  if (
    !window.supabase ||
    SUPABASE_PUBLISHABLE_KEY.includes("PASTE_")
  ) {
    console.error("Supabase configuration is missing.");
    alert("Add your Supabase publishable key in script.js.");
    return;
  }

  const db = window.supabase.createClient(
    SUPABASE_URL,
    SUPABASE_PUBLISHABLE_KEY
  );

  // ==========================================
  // 2. HELPERS AND STATE
  // ==========================================

  const $ = (selector, root = document) =>
    root.querySelector(selector);

  const $$ = (selector, root = document) =>
    [...root.querySelectorAll(selector)];

  const KEYS = {
    theme: "scoresense_ai_theme_v2",
    migration: "scoresense_cloud_migration_v1"
  };

  const LEGACY_USER_KEYS = [
    "scoresense_users_v2",
    "scoresense_ai_users_v2",
    "scoresense_users_v1",
    "scoresense_ai_users_v1"
  ];

  const LEGACY_SESSION_KEYS = [
    "scoresense_session_v2",
    "scoresense_ai_session_v2",
    "scoresense_session_v1",
    "scoresense_ai_session_v1"
  ];

  const SUBJECTS = {
    "JEE Main": ["Physics", "Chemistry", "Mathematics"],
    "JEE Advanced": ["Physics", "Chemistry", "Mathematics"],
    "JEE Main + Advanced": [
      "Physics",
      "Chemistry",
      "Mathematics"
    ],
    NEET: ["Physics", "Chemistry", "Biology"],
    Boards: [
      "Physics",
      "Chemistry",
      "Mathematics",
      "Biology",
      "English"
    ]
  };

  const CHAPTERS = {
    "Class 11": {
      Physics: [
        "Units and Measurements",
        "Motion in a Straight Line",
        "Motion in a Plane",
        "Laws of Motion",
        "Work, Energy and Power",
        "System of Particles and Rotational Motion",
        "Gravitation",
        "Mechanical Properties of Solids",
        "Mechanical Properties of Fluids",
        "Thermal Properties of Matter",
        "Thermodynamics",
        "Kinetic Theory",
        "Oscillations",
        "Waves"
      ],
      Chemistry: [
        "Some Basic Concepts of Chemistry",
        "Structure of Atom",
        "Classification of Elements",
        "Chemical Bonding",
        "Chemical Thermodynamics",
        "Equilibrium",
        "Redox Reactions",
        "Organic Chemistry: Basic Principles",
        "Hydrocarbons"
      ],
      Mathematics: [
        "Sets",
        "Relations and Functions",
        "Trigonometric Functions",
        "Complex Numbers",
        "Linear Inequalities",
        "Permutations and Combinations",
        "Binomial Theorem",
        "Sequence and Series",
        "Straight Lines",
        "Conic Sections",
        "Introduction to 3D Geometry",
        "Limits and Derivatives",
        "Statistics",
        "Probability"
      ],
      Biology: [
        "The Living World",
        "Biological Classification",
        "Plant Kingdom",
        "Animal Kingdom",
        "Morphology of Flowering Plants",
        "Anatomy of Flowering Plants",
        "Cell: The Unit of Life",
        "Biomolecules",
        "Cell Cycle and Cell Division",
        "Plant Physiology",
        "Human Physiology"
      ],
      English: [
        "Reading Comprehension",
        "Writing Skills",
        "Grammar",
        "Literature"
      ]
    },

    "Class 12": {
      Physics: [
        "Electric Charges and Fields",
        "Electrostatic Potential and Capacitance",
        "Current Electricity",
        "Moving Charges and Magnetism",
        "Magnetism and Matter",
        "Electromagnetic Induction",
        "Alternating Current",
        "Electromagnetic Waves",
        "Ray Optics",
        "Wave Optics",
        "Dual Nature of Radiation and Matter",
        "Atoms",
        "Nuclei",
        "Semiconductor Electronics"
      ],
      Chemistry: [
        "Solutions",
        "Electrochemistry",
        "Chemical Kinetics",
        "d and f Block Elements",
        "Coordination Compounds",
        "Haloalkanes and Haloarenes",
        "Alcohols, Phenols and Ethers",
        "Aldehydes, Ketones and Carboxylic Acids",
        "Amines",
        "Biomolecules"
      ],
      Mathematics: [
        "Relations and Functions",
        "Inverse Trigonometric Functions",
        "Matrices",
        "Determinants",
        "Continuity and Differentiability",
        "Applications of Derivatives",
        "Integrals",
        "Applications of Integrals",
        "Differential Equations",
        "Vector Algebra",
        "Three Dimensional Geometry",
        "Linear Programming",
        "Probability"
      ],
      Biology: [
        "Sexual Reproduction in Flowering Plants",
        "Human Reproduction",
        "Reproductive Health",
        "Principles of Inheritance and Variation",
        "Molecular Basis of Inheritance",
        "Evolution",
        "Human Health and Disease",
        "Microbes in Human Welfare",
        "Biotechnology",
        "Organisms and Populations",
        "Ecosystem",
        "Biodiversity and Conservation"
      ],
      English: [
        "Reading Comprehension",
        "Writing Skills",
        "Grammar",
        "Literature"
      ]
    },

    Foundation: {
      Physics: [
        "Motion",
        "Force and Laws of Motion",
        "Gravitation",
        "Work and Energy",
        "Sound",
        "Light",
        "Electricity",
        "Magnetic Effects of Current"
      ],
      Chemistry: [
        "Matter in Our Surroundings",
        "Is Matter Around Us Pure",
        "Atoms and Molecules",
        "Structure of Atom",
        "Chemical Reactions",
        "Acids, Bases and Salts",
        "Metals and Non-metals",
        "Carbon and Its Compounds"
      ],
      Mathematics: [
        "Number Systems",
        "Polynomials",
        "Coordinate Geometry",
        "Linear Equations",
        "Quadratic Equations",
        "Arithmetic Progressions",
        "Triangles",
        "Trigonometry",
        "Statistics",
        "Probability"
      ],
      Biology: [
        "Cell Biology",
        "Tissues",
        "Life Processes",
        "Control and Coordination",
        "Reproduction",
        "Heredity",
        "Our Environment"
      ],
      English: [
        "Reading Comprehension",
        "Writing Skills",
        "Grammar",
        "Literature"
      ]
    }
  };

  const QUOTES = [
    "Consistency beats motivation.",
    "Every mock test is feedback.",
    "Small steps, repeated daily, create remarkable change.",
    "Progress is built one focused session at a time.",
    "Your next score starts with your next decision.",
    "Don't just count the hours. Make the hours count."
  ];

  let currentUser = null;
  let profile = null;
  let examProfile = null;
  let tests = [];
  let goals = [];
  let chart = null;
  let authMode = "signup";
  let toastTimer = null;

  const today = () =>
    new Date().toLocaleDateString("en-CA");

  const escapeHTML = value =>
    String(value ?? "").replace(
      /[&<>"']/g,
      character => ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#39;"
      })[character]
    );

  const makeId = () =>
    globalThis.crypto?.randomUUID?.() ||
    `${Date.now()}-${Math.random().toString(16).slice(2)}`;

  const showToast = message => {
    const element = $("#toast");
    if (!element) return;

    element.textContent = message;
    element.classList.add("show");

    clearTimeout(toastTimer);

    toastTimer = setTimeout(() => {
      element.classList.remove("show");
    }, 3000);
  };

  const showView = viewId => {
    ["landingView", "authView", "appView"].forEach(id => {
      $("#" + id)?.classList.toggle("hidden", id !== viewId);
    });
  };

  const randomQuote = () =>
    QUOTES[Math.floor(Math.random() * QUOTES.length)];

  const updateQuote = () => {
    if ($("#landingQuote")) {
      $("#landingQuote").textContent = randomQuote();
    }

    if ($("#dashboardQuote")) {
      $("#dashboardQuote").textContent = randomQuote();
    }
  };

  const subjectsForExam = exam =>
    SUBJECTS[exam] || SUBJECTS["JEE Main"];

  const chaptersFor = (stage, subject) => {
    if (stage === "Dropper") {
      return [
        ...(CHAPTERS["Class 11"][subject] || []),
        ...(CHAPTERS["Class 12"][subject] || [])
      ];
    }

    return CHAPTERS[stage]?.[subject] || [];
  };

  // ==========================================
  // 3. THEME
  // ==========================================

  function setTheme(theme) {
    document.body.classList.toggle(
      "light",
      theme === "light"
    );

    localStorage.setItem(KEYS.theme, theme);

    $$("[data-theme-toggle]").forEach(button => {
      const label = $("span", button);

      if (label) {
        label.textContent =
          theme === "light" ? "Dark mode" : "Light mode";
      }
    });

    if (chart) chart.update();
  }

   // ==========================================
  // 4. AUTHENTICATION - UPDATED
  // ==========================================

  function setAuthMode(mode) {
    authMode = mode;

    $("#authTitle").textContent =
      mode === "signup" ? "Create your account." : "Welcome back.";

    $("#authSubtitle").textContent =
      mode === "signup"
        ? "A clearer picture of your progress begins with you."
        : "Pick up where your progress left off.";

    $("#authSubmit").innerHTML =
      mode === "signup"
        ? 'Create account <span>→</span>'
        : 'Log in <span>→</span>';

    if ($("#authPassword")) {
      $("#authPassword").autocomplete =
        mode === "signup" ? "new-password" : "current-password";
    }

    $("#authNameGroup")?.classList.toggle("hidden", mode === "login");
    $("#authStudentDetails")?.classList.toggle("hidden", mode === "login");

    $("#authExam")?.closest(".form-two")?.classList.toggle(
      "hidden", mode === "login"
    );

    $("#authTarget")?.closest(".form-two")?.classList.toggle(
      "hidden", mode === "login"
    );

    if ($("#authModeToggle")) {
      $("#authModeToggle").textContent =
        mode === "signup"
          ? "Already have an account? Log in"
          : "New to ScoreSense AI? Create an account";
    }

    const forgot = $("#forgotPasswordButton");
    if (forgot) {
      forgot.classList.toggle("hidden", mode !== "login");
    }
  }

  function startAuth() {
    setAuthMode("signup");
    showView("authView");
    $("#authName")?.focus();
  }

  // Friendly authentication error messages
  function authErrorMessage(error) {
    const message = String(error?.message || "").toLowerCase();

    if (message.includes("invalid login credentials")) {
      return "Incorrect email or password. Please check and try again.";
    }

    if (message.includes("email not confirmed")) {
      return "Please verify your email before logging in.";
    }

    if (message.includes("user already registered")) {
      return "This email is already registered. Please log in.";
    }

    if (message.includes("password should be")) {
      return "Password must contain at least 8 characters.";
    }

    if (message.includes("rate limit")) {
      return "Too many attempts. Please wait a little and try again.";
    }

    if (message.includes("network")) {
      return "Network issue. Check your internet connection.";
    }

    return error?.message || "Something went wrong. Please try again.";
  }

  // Add missing auth controls without requiring HTML edits
  function setupAuthExtras() {
    const password = $("#authPassword");
    const authForm = $("#authForm");

    if (!password || !authForm) return;

    // Show / Hide password
    if (!$("#togglePasswordButton")) {
      const toggle = document.createElement("button");

      toggle.type = "button";
      toggle.id = "togglePasswordButton";
      toggle.textContent = "Show";
      toggle.setAttribute("aria-label", "Show password");

      toggle.style.cssText = `
        margin-top:8px;
        padding:5px 12px;
        border:1px solid var(--line);
        border-radius:8px;
        background:transparent;
        color:var(--muted);
        cursor:pointer;
        font:inherit;
      `;

      password.insertAdjacentElement("afterend", toggle);

      toggle.addEventListener("click", () => {
        const isHidden = password.type === "password";

        password.type = isHidden ? "text" : "password";
        toggle.textContent = isHidden ? "Hide" : "Show";
        toggle.setAttribute(
          "aria-label",
          isHidden ? "Hide password" : "Show password"
        );
      });
    }

    // Forgot password
    if (!$("#forgotPasswordButton")) {
      const forgot = document.createElement("button");

      forgot.type = "button";
      forgot.id = "forgotPasswordButton";
      forgot.textContent = "Forgot password?";
      forgot.className = "hidden";

      forgot.style.cssText = `
        display:block;
        margin-top:12px;
        padding:0;
        border:0;
        background:transparent;
        color:var(--accent, #7694ff);
        cursor:pointer;
        font:inherit;
      `;

      $("#togglePasswordButton").insertAdjacentElement(
        "afterend", forgot
      );

      forgot.addEventListener("click", sendPasswordReset);
    }

    // Ensure Google button has a working listener
    $("#googleLoginButton")?.addEventListener(
      "click", googleLogin
    );

    // Recovery screen
    if (!$("#passwordRecoveryPanel")) {
      const panel = document.createElement("div");

      panel.id = "passwordRecoveryPanel";
      panel.className = "hidden";

      panel.style.cssText = `
        position:fixed;
        inset:0;
        z-index:99999;
        display:flex;
        align-items:center;
        justify-content:center;
        padding:20px;
        background:rgba(0,0,0,.78);
      `;

      panel.innerHTML = `
        <div style="
          width:100%;
          max-width:420px;
          padding:28px;
          border-radius:18px;
          background:var(--card, #171923);
          color:var(--text, #fff);
          border:1px solid var(--line, #333);
        ">
          <h2 style="margin-top:0">Create a new password</h2>
          <p style="color:var(--muted)">
            Enter your new password below.
          </p>

          <label for="recoveryPassword">New password</label>
          <input
            id="recoveryPassword"
            type="password"
            minlength="8"
            autocomplete="new-password"
            placeholder="At least 8 characters"
            style="width:100%;margin:10px 0;padding:12px"
          />

          <label for="recoveryPasswordConfirm">
            Confirm new password
          </label>
          <input
            id="recoveryPasswordConfirm"
            type="password"
            minlength="8"
            autocomplete="new-password"
            placeholder="Enter password again"
            style="width:100%;margin:10px 0;padding:12px"
          />

          <button
            id="saveRecoveryPassword"
            type="button"
            style="
              width:100%;
              margin-top:12px;
              padding:13px;
              border:0;
              border-radius:10px;
              background:#7694ff;
              color:white;
              font-weight:700;
              cursor:pointer;
            "
          >
            Update password
          </button>
        </div>
      `;

      document.body.appendChild(panel);

      $("#saveRecoveryPassword").addEventListener(
        "click", saveNewPassword
      );
    }
  }

  // Send password reset email
  async function sendPasswordReset() {
    const email = $("#authEmail")?.value.trim();

    if (!email) {
      showToast("Enter your registered email first.");
      $("#authEmail")?.focus();
      return;
    }

    const button = $("#forgotPasswordButton");
    button.disabled = true;
    button.textContent = "Sending...";

    try {
      const redirectTo =
        window.location.origin + window.location.pathname;

      const { error } = await db.auth.resetPasswordForEmail(
        email,
        { redirectTo }
      );

      if (error) throw error;

      showToast(
        "Password reset email requested. Check your inbox and spam folder."
      );
    } catch (error) {
      console.error("Password reset error:", error);
      showToast(authErrorMessage(error));
    } finally {
      button.disabled = false;
      button.textContent = "Forgot password?";
    }
  }

  // Google login
  async function googleLogin() {
    const button = $("#googleLoginButton");

    if (button) {
      button.disabled = true;
    }

    try {
      const redirectTo =
        window.location.origin + window.location.pathname;

      const { error } = await db.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo
        }
      });

      if (error) throw error;

    } catch (error) {
      console.error("Google login error:", error);
      showToast(authErrorMessage(error));

      if (button) {
        button.disabled = false;
      }
    }
  }

  // Display password recovery screen
  function showPasswordRecovery() {
    showView("authView");

    const panel = $("#passwordRecoveryPanel");

    if (panel) {
      panel.classList.remove("hidden");
      panel.style.display = "flex";
    }
  }

  // Save new password after recovery link
  async function saveNewPassword() {
    const password = $("#recoveryPassword")?.value || "";
    const confirmPassword =
      $("#recoveryPasswordConfirm")?.value || "";

    if (password.length < 8) {
      showToast("New password must be at least 8 characters.");
      return;
    }

    if (password !== confirmPassword) {
      showToast("Passwords do not match.");
      return;
    }

    const button = $("#saveRecoveryPassword");
    button.disabled = true;
    button.textContent = "Updating...";

    try {
      const { error } = await db.auth.updateUser({
        password
      });

      if (error) throw error;

      $("#passwordRecoveryPanel")?.classList.add("hidden");

      showToast("Password updated successfully. You can now log in.");

      // Keep the signed-in session; load the user's workspace.
      await loadWorkspace();
      showApp();

    } catch (error) {
      console.error("Password update error:", error);
      showToast(authErrorMessage(error));
    } finally {
      button.disabled = false;
      button.textContent = "Update password";
    }
  }

  async function handleAuth(event) {
    event.preventDefault();

    const email = $("#authEmail")?.value.trim();
    const password = $("#authPassword")?.value || "";

    if (!email || !password) {
      showToast("Enter your email and password.");
      return;
    }

    // Minimum length applies to signup, not existing-user login.
    if (authMode === "signup" && password.length < 8) {
      showToast("Password must be at least 8 characters.");
      return;
    }

    const button = $("#authSubmit");
    button.disabled = true;
    button.textContent = "Please wait...";

    try {
      if (authMode === "signup") {
        const name = $("#authName")?.value.trim();

        if (!name) {
          throw new Error("Enter your name.");
        }

        const target = Number($("#authTarget")?.value);
        const maximum = Number($("#authTargetMax")?.value);

        if (
          !target ||
          !maximum ||
          target <= 0 ||
          maximum <= 0 ||
          target > maximum
        ) {
          throw new Error(
            "Check your target score and maximum marks."
          );
        }

        const { data, error } = await db.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo:
              window.location.origin + window.location.pathname,
            data: {
              full_name: name
            }
          }
        });

        if (error) throw error;

        if (!data.session) {
          showToast(
            "Account created. Verify your email, then log in."
          );

          setAuthMode("login");
          return;
        }

        await loadWorkspace();
        currentUser = data.user;

        await saveProfile({
          full_name: name,
          education_stage: $("#authStage").value
        });

        await saveExamProfile(
          $("#authExam").value,
          target,
          maximum
        );

        await loadWorkspace();
        showApp();

        showToast("Account created successfully.");

      } else {
        const { error } = await db.auth.signInWithPassword({
          email,
          password
        });

        if (error) throw error;

        await loadWorkspace();
        await importLegacyDataIfAvailable();

        showApp();
        showToast("Welcome back!");
      }

    } catch (error) {
      console.error("Authentication error:", error);
      showToast(authErrorMessage(error));

    } finally {
      button.disabled = false;

      button.innerHTML =
        authMode === "signup"
          ? 'Create account <span>→</span>'
          : 'Log in <span>→</span>';
    }
  }

  async function logout() {
    const { error } = await db.auth.signOut();

    if (error) {
      showToast(error.message);
      return;
    }

    currentUser = null;
    profile = null;
    examProfile = null;
    tests = [];
    goals = [];

    showView("landingView");
    showToast("You have logged out.");
  }

  // ==========================================
  // 5. DATABASE: PROFILE
  // ==========================================

  async function saveProfile(values) {
    const { data, error } = await db
      .from("profiles")
      .upsert({
        id: currentUser.id,
        full_name: values.full_name,
        education_stage: values.education_stage,
        updated_at: new Date().toISOString()
      })
      .select()
      .single();

    if (error) throw error;

    profile = data;
    return data;
  }

  async function saveExamProfile(exam, target, maximum) {
    const { data: existing, error: findError } = await db
      .from("exam_profiles")
      .select("*")
      .eq("user_id", currentUser.id)
      .eq("exam_type", exam)
      .limit(1);

    if (findError) throw findError;

    if (existing?.length) {
      const { data, error } = await db
        .from("exam_profiles")
        .update({
          target_score: target,
          maximum_score: maximum
        })
        .eq("id", existing[0].id)
        .select()
        .single();

      if (error) throw error;

      examProfile = data;
      return data;
    }

    const { data, error } = await db
      .from("exam_profiles")
      .insert({
        user_id: currentUser.id,
        exam_type: exam,
        target_score: target,
        maximum_score: maximum
      })
      .select()
      .single();

    if (error) throw error;

    examProfile = data;
    return data;
  }

  async function updateProfileFromForm(event) {
    event.preventDefault();

    try {
      const name = $("#profileName").value.trim();
      const stage = $("#profileClass").value;
      const exam = $("#profileExam").value;
      const target = Number($("#profileTarget").value);

      const maximum = Number(
        $("#profileTargetMax")?.value ||
        examProfile?.maximum_score ||
        300
      );

      if (!name || !target || !maximum || target > maximum) {
        showToast("Please check your profile details.");
        return;
      }

      await saveProfile({
        full_name: name,
        education_stage: stage
      });

      await saveExamProfile(exam, target, maximum);

      await loadWorkspace();
      closeModals();
      showApp();

      showToast("Profile updated.");
    } catch (error) {
      console.error(error);
      showToast(error.message || "Could not update profile.");
    }
  }

  // ==========================================
  // 6. DATABASE: LOAD WORKSPACE
  // ==========================================

  async function loadWorkspace() {
    const { data: authData, error: authError } =
      await db.auth.getUser();

    if (authError) throw authError;

    currentUser = authData.user;

    if (!currentUser) {
      throw new Error("Please log in again.");
    }

    const { data: profileData, error: profileError } =
      await db
        .from("profiles")
        .select("*")
        .eq("id", currentUser.id)
        .maybeSingle();

    if (profileError) throw profileError;

    profile = profileData;

    const { data: examRows, error: examError } =
      await db
        .from("exam_profiles")
        .select("*")
        .eq("user_id", currentUser.id)
        .order("created_at", { ascending: false });

    if (examError) throw examError;

    examProfile = examRows?.[0] || null;

    const { data: testRows, error: testsError } =
      await db
        .from("tests")
        .select("*")
        .eq("user_id", currentUser.id)
        .order("test_date", { ascending: false });

    if (testsError) throw testsError;

    const testIds = (testRows || []).map(test => test.id);

    let subjectRows = [];
    let lossRows = [];

    if (testIds.length) {
      const { data, error } = await db
        .from("test_subject_scores")
        .select("*")
        .in("test_id", testIds);

      if (error) throw error;
      subjectRows = data || [];

      const { data: losses, error: lossError } = await db
        .from("test_chapter_losses")
        .select("*")
        .in("test_id", testIds);

      if (lossError) throw lossError;
      lossRows = losses || [];
    }

    tests = (testRows || []).map(test => ({
      id: test.id,
      name: test.test_name,
      date: test.test_date,
      type: test.test_type || "Full Test",
      score: Number(test.score),
      max: Number(test.max_score),
      legacy_id: test.legacy_id,
      subjectScores: subjectRows
        .filter(row => row.test_id === test.id)
        .map(row => ({
          subject: row.subject,
          marks: Number(row.marks_obtained),
          max: Number(row.max_marks)
        })),
      leaks: lossRows
        .filter(row => row.test_id === test.id)
        .map(row => ({
          subject: row.subject,
          chapter: row.chapter,
          marks: Number(row.marks_lost)
        }))
    }));

    const { data: goalRows, error: goalsError } =
      await db
        .from("daily_goals")
        .select("*")
        .eq("user_id", currentUser.id)
        .order("goal_date", { ascending: true });

    if (goalsError) throw goalsError;

    goals = (goalRows || []).map(goal => ({
      id: goal.id,
      text: goal.goal_text,
      date: goal.goal_date,
      done: Boolean(goal.is_completed),
      legacy_id: goal.legacy_id
    }));
  }

  // ==========================================
  // 7. SAFE LEGACY DATA IMPORT
  // ==========================================

  function parseStoredJSON(key) {
    try {
      const raw = localStorage.getItem(key);
      return raw ? JSON.parse(raw) : null;
    } catch (error) {
      console.warn("Could not read local data:", key, error);
      return null;
    }
  }

  function findLegacyWorkspace() {
    const allUsers = {};

    LEGACY_USER_KEYS.forEach(key => {
      const stored = parseStoredJSON(key);

      if (stored && typeof stored === "object") {
        Object.assign(allUsers, stored);
      }
    });

    const session = LEGACY_SESSION_KEYS
      .map(key => localStorage.getItem(key))
      .find(Boolean);

    if (session && allUsers[session]) {
      return allUsers[session];
    }

    const available = Object.values(allUsers);

    if (available.length === 1) {
      return available[0];
    }

    if (available.length > 1) {
      const names = available
        .map((item, index) => `${index + 1}. ${item.name || "Student"}`)
        .join("\n");

      const choice = prompt(
        "More than one old workspace was found.\n" +
        "Enter the number of the workspace to import:\n\n" +
        names
      );

      const selected = Number(choice) - 1;

      if (
        Number.isInteger(selected) &&
        selected >= 0 &&
        selected < available.length
      ) {
        return available[selected];
      }
    }

    return null;
  }

  function legacyMigrationKey() {
    return `${KEYS.migration}_${currentUser.id}`;
  }

  async function importLegacyDataIfAvailable() {
    if (!currentUser) return;

    const marker = legacyMigrationKey();

    if (localStorage.getItem(marker) === "complete") {
      return;
    }

    const oldUser = findLegacyWorkspace();

    if (!oldUser) {
      return;
    }

    const confirmed = confirm(
      "An old ScoreSense workspace was found.\n\n" +
      `Tests: ${(oldUser.tests || []).length}\n` +
      `Goals: ${(oldUser.goals || []).length}\n\n` +
      "Import these records into your signed-in account?\n" +
      "Your original browser data will not be deleted."
    );

    if (!confirmed) return;

    showToast("Importing your old records...");

    try {
      await importLegacyProfile(oldUser);
      await importLegacyTests(oldUser.tests || []);
      await importLegacyGoals(oldUser.goals || []);

      localStorage.setItem(marker, "complete");

      await loadWorkspace();

      showToast("Import completed successfully.");
    } catch (error) {
      console.error("Import error:", error);

      showToast(
        "Import stopped. Your original local data is still محفوظ. " +
        (error.message || "")
      );
    }
  }

  async function importLegacyProfile(oldUser) {
    const name = oldUser.name || profile?.full_name || "Student";
    const stage = oldUser.stage || "Class 11";
    const exam = oldUser.exam || "JEE Main";

    await saveProfile({
      full_name: name,
      education_stage: stage
    });

    const target = Number(oldUser.target) || 220;
    const maximum = Number(oldUser.targetMax || oldUser.maximum) || 300;

    await saveExamProfile(
      exam,
      Math.min(target, maximum),
      maximum
    );
  }

  function normalizeLegacySubjectScores(test) {
    const raw =
      test.subjectScores ||
      test.subject_scores ||
      test.subjectMarks ||
      [];

    if (Array.isArray(raw)) {
      return raw.map(item => ({
        subject: item.subject,
        marks: Number(item.marks ?? item.marks_obtained),
        max: Number(item.max ?? item.max_marks)
      }));
    }

    if (raw && typeof raw === "object") {
      return Object.entries(raw).map(([subject, value]) => ({
        subject,
        marks: Number(value.marks ?? value.score ?? value),
        max: Number(value.max ?? value.maximum ?? 0)
      }));
    }

    return [];
  }

  function normalizeLegacyLeaks(test) {
    return (test.leaks || []).map((leak, index) => ({
      legacy_id: `legacy-leak-${index}`,
      subject: leak.subject || "Unspecified",
      chapter: String(leak.chapter || "Unspecified").trim(),
      marks: Number(leak.marks ?? leak.marks_lost)
    })).filter(leak =>
      leak.chapter &&
      Number.isFinite(leak.marks) &&
      leak.marks > 0
    );
  }

  async function importLegacyTests(oldTests) {
    for (let index = 0; index < oldTests.length; index++) {
      const oldTest = oldTests[index];

      const legacyId = `legacy-test-${String(
        oldTest.id || index
      )}`;

      let testId = null;

      const { data: existing, error: findError } = await db
        .from("tests")
        .select("id")
        .eq("user_id", currentUser.id)
        .eq("legacy_id", legacyId)
        .maybeSingle();

      if (findError) throw findError;

      if (existing) {
        testId = existing.id;
      } else {
        const score = Number(oldTest.score);
        const maximum = Number(oldTest.max);

        if (
          !Number.isFinite(score) ||
          !Number.isFinite(maximum) ||
          maximum <= 0 ||
          score < 0 ||
          score > maximum
        ) {
          console.warn("Skipped invalid old test:", oldTest);
          continue;
        }

        const { data, error } = await db
          .from("tests")
          .insert({
            user_id: currentUser.id,
            exam_profile_id: examProfile?.id || null,
            legacy_id: legacyId,
            test_name: String(oldTest.name || "Imported test"),
            test_type: String(oldTest.type || "Full Test"),
            test_date: oldTest.date || today(),
            score,
            max_score: maximum
          })
          .select("id")
          .single();

        if (error) throw error;

        testId = data.id;
      }

      // Subject scores are imported only when the old record
      // actually contains valid subject-wise marks.

      const subjectScores = normalizeLegacySubjectScores(oldTest);

      for (const subject of subjectScores) {
        if (
          !subject.subject ||
          !Number.isFinite(subject.marks) ||
          !Number.isFinite(subject.max) ||
          subject.max <= 0 ||
          subject.marks < 0 ||
          subject.marks > subject.max
        ) {
          continue;
        }

        const { data: found, error: findSubjectError } = await db
          .from("test_subject_scores")
          .select("id")
          .eq("test_id", testId)
          .eq("subject", subject.subject)
          .maybeSingle();

        if (findSubjectError) throw findSubjectError;

        if (!found) {
          const { error } = await db
            .from("test_subject_scores")
            .insert({
              test_id: testId,
              subject: subject.subject,
              marks_obtained: subject.marks,
              max_marks: subject.max
            });

          if (error) throw error;
        }
      }

      // Old chapter losses without a subject are kept as
      // "Unspecified". We do not guess the subject.

      const leaks = normalizeLegacyLeaks(oldTest);

      for (const leak of leaks) {
        const { data: found, error: findLossError } = await db
          .from("test_chapter_losses")
          .select("id")
          .eq("test_id", testId)
          .eq("legacy_id", leak.legacy_id)
          .maybeSingle();

        if (findLossError) throw findLossError;

        if (!found) {
          const { error } = await db
            .from("test_chapter_losses")
            .insert({
              test_id: testId,
              legacy_id: leak.legacy_id,
              subject: leak.subject,
              chapter: leak.chapter,
              marks_lost: leak.marks
            });

          if (error) throw error;
        }
      }
    }
  }

  async function importLegacyGoals(oldGoals) {
    for (let index = 0; index < oldGoals.length; index++) {
      const oldGoal = oldGoals[index];

      const legacyId = `legacy-goal-${String(
        oldGoal.id || index
      )}`;

      const { data: existing, error: findError } = await db
        .from("daily_goals")
        .select("id")
        .eq("user_id", currentUser.id)
        .eq("legacy_id", legacyId)
        .maybeSingle();

      if (findError) throw findError;
      if (existing) continue;

      const completed = Boolean(oldGoal.done);

      const { error } = await db
        .from("daily_goals")
        .insert({
          user_id: currentUser.id,
          legacy_id: legacyId,
          goal_text: String(oldGoal.text || "Imported goal"),
          goal_date: oldGoal.date || today(),
          is_completed: completed,
          completed_at: completed
            ? new Date().toISOString()
            : null
        });

      if (error) throw error;
    }
  }

  // ==========================================
  // 8. TEST FORM: SUBJECTS AND CHAPTERS
  // ==========================================

  function populateSubjects() {
    const subjectSelect = $("#leakSubject");
    const subjectContainer = $("#subjectScoreRows");

    if (!subjectSelect || !subjectContainer) return;

    const subjects = subjectsForExam(
      examProfile?.exam_type || "JEE Main"
    );

    subjectSelect.innerHTML =
      '<option value="">Select subject</option>' +
      subjects.map(subject =>
        `<option value="${escapeHTML(subject)}">${escapeHTML(subject)}</option>`
      ).join("");

    subjectContainer.innerHTML = subjects.map(subject => `
      <div class="subject-score-row">
        <label>${escapeHTML(subject)}</label>
        <div class="form-two">
          <input
            type="number"
            min="0"
            step="0.5"
            data-subject-score="${escapeHTML(subject)}"
            placeholder="Marks obtained"
          />
          <input
            type="number"
            min="0.5"
            step="0.5"
            data-subject-max="${escapeHTML(subject)}"
            placeholder="Maximum marks"
          />
        </div>
      </div>
    `).join("");
  }

  function updateChapterSuggestions() {
    const datalist = $("#chapterSuggestions");
    const subject = $("#leakSubject")?.value;
    const stage = profile?.education_stage || "Class 11";

    if (!datalist) return;

    datalist.innerHTML = "";

    if (!subject) return;

    datalist.innerHTML = chaptersFor(stage, subject)
      .map(chapter =>
        `<option value="${escapeHTML(chapter)}"></option>`
      )
      .join("");
  }

  function collectSubjectScores() {
    const result = [];

    $$("[data-subject-score]").forEach(input => {
      const subject = input.dataset.subjectScore;
      const maxInput = $(`[data-subject-max="${CSS.escape(subject)}"]`);

      const marksValue = input.value.trim();
      const maxValue = maxInput?.value.trim();

      if (!marksValue && !maxValue) return;

      const marks = Number(marksValue);
      const maximum = Number(maxValue);

      if (
        !marksValue ||
        !maxValue ||
        !Number.isFinite(marks) ||
        !Number.isFinite(maximum) ||
        maximum <= 0 ||
        marks < 0 ||
        marks > maximum
      ) {
        throw new Error(
          `Check the ${subject} marks. Enter both values correctly.`
        );
      }

      result.push({
        subject,
        marks,
        max: maximum
      });
    });

    return result;
  }

  function addLeakInput() {
    const container = $("#extraLeaks");
    if (!container) return;

    const subjects = subjectsForExam(
      examProfile?.exam_type || "JEE Main"
    );

    const row = document.createElement("div");
    row.className = "extra-leak-row";

    row.innerHTML = `
      <select aria-label="Chapter subject">
        <option value="">Subject</option>
        ${subjects.map(subject =>
          `<option value="${escapeHTML(subject)}">${escapeHTML(subject)}</option>`
        ).join("")}
      </select>

      <input
        type="text"
        maxlength="80"
        placeholder="Chapter / topic"
        aria-label="Chapter name"
      />

      <input
        type="number"
        min="0.5"
        step="0.5"
        placeholder="Marks lost"
        aria-label="Marks lost"
      />

      <button type="button" aria-label="Remove chapter">×</button>
    `;

    row.querySelector("button").addEventListener("click", () => {
      row.remove();
    });

    container.appendChild(row);
  }

  function collectLeaks() {
    const leaks = [];

    const mainSubject = $("#leakSubject")?.value || "";
    const chapter = $("#leakChapter")?.value.trim() || "";
    const marksValue = $("#leakMarks")?.value.trim() || "";

    if (chapter || marksValue) {
      const marks = Number(marksValue);

      if (
        !mainSubject ||
        !chapter ||
        !Number.isFinite(marks) ||
        marks <= 0
      ) {
        throw new Error(
          "Complete the subject, chapter and marks lost fields."
        );
      }

      leaks.push({
        subject: mainSubject,
        chapter,
        marks
      });
    }

    $$(".extra-leak-row", $("#extraLeaks")).forEach(row => {
      const subject = row.querySelector("select")?.value;
      const inputs = $$("input", row);

      const chapterName = inputs[0]?.value.trim();
      const marks = Number(inputs[1]?.value);

      if (!subject && !chapterName && !inputs[1]?.value) {
        return;
      }

      if (
        !subject ||
        !chapterName ||
        !Number.isFinite(marks) ||
        marks <= 0
      ) {
        throw new Error(
          "Complete every additional chapter entry."
        );
      }

      leaks.push({
        subject,
        chapter: chapterName,
        marks
      });
    });

    return leaks;
  }

  function resetTestForm() {
    $("#testForm")?.reset();

    if ($("#testDate")) {
      $("#testDate").value = today();
    }

    if ($("#testMax")) {
      $("#testMax").value =
        examProfile?.maximum_score || 300;
    }

    if ($("#extraLeaks")) {
      $("#extraLeaks").innerHTML = "";
    }

    populateSubjects();
    updateChapterSuggestions();
  }

  // ==========================================
  // 9. CREATE TEST IN SUPABASE
  // ==========================================

  async function createTest(event) {
    event.preventDefault();

    try {
      const name = $("#testName").value.trim();
      const date = $("#testDate").value;
      const type = $("#testType").value;
      const score = Number($("#testScore").value);
      const maximum = Number($("#testMax").value);

      if (!name || !date) {
        throw new Error("Enter the test name and date.");
      }

      if (
        !Number.isFinite(score) ||
        !Number.isFinite(maximum) ||
        maximum <= 0 ||
        score < 0 ||
        score > maximum
      ) {
        throw new Error("Check the overall test marks.");
      }

      const subjectScores = collectSubjectScores();
      const leaks = collectLeaks();

      const submitButton = $("#testForm button[type='submit']");
      submitButton.disabled = true;
      submitButton.textContent = "Saving...";

      const { data: newTest, error: testError } = await db
        .from("tests")
        .insert({
          user_id: currentUser.id,
          exam_profile_id: examProfile?.id || null,
          test_name: name,
          test_type: type,
          test_date: date,
          score,
          max_score: maximum
        })
        .select()
        .single();

      if (testError) throw testError;

      if (subjectScores.length) {
        const { error } = await db
          .from("test_subject_scores")
          .insert(
            subjectScores.map(item => ({
              test_id: newTest.id,
              subject: item.subject,
              marks_obtained: item.marks,
              max_marks: item.max
            }))
          );

        if (error) {
          await db.from("tests").delete().eq("id", newTest.id);
          throw error;
        }
      }

      if (leaks.length) {
        const { error } = await db
          .from("test_chapter_losses")
          .insert(
            leaks.map(item => ({
              test_id: newTest.id,
              subject: item.subject,
              chapter: item.chapter,
              marks_lost: item.marks
            }))
          );

        if (error) {
          await db.from("tests").delete().eq("id", newTest.id);
          throw error;
        }
      }

      await loadWorkspace();

      closeModals();
      renderDashboard();

      showToast("Test result saved to your account.");
    } catch (error) {
      console.error("Test save error:", error);
      showToast(error.message || "Could not save test.");
    } finally {
      const button = $("#testForm button[type='submit']");

      if (button) {
        button.disabled = false;
        button.innerHTML =
          'Save test result <span>→</span>';
      }
    }
  }

  // ==========================================
  // 10. DAILY GOALS
  // ==========================================

  async function addGoal(event) {
    event.preventDefault();

    const input = $("#goalInput");
    const text = input.value.trim();

    if (!text) return;

    try {
      const { error } = await db
        .from("daily_goals")
        .insert({
          user_id: currentUser.id,
          goal_text: text,
          goal_date: today(),
          is_completed: false
        });

      if (error) throw error;

      input.value = "";

      await loadWorkspace();
      renderDashboard();

      showToast("Goal added.");
    } catch (error) {
      console.error(error);
      showToast(error.message || "Could not add goal.");
    }
  }

  async function toggleGoal(id, done) {
    try {
      const values = {
        is_completed: done,
        completed_at: done
          ? new Date().toISOString()
          : null
      };

      const { error } = await db
        .from("daily_goals")
        .update(values)
        .eq("id", id)
        .eq("user_id", currentUser.id);

      if (error) throw error;

      await loadWorkspace();
      renderDashboard();
    } catch (error) {
      console.error(error);
      showToast("Could not update goal.");
    }
  }

  async function deleteGoal(id) {
    if (!confirm("Delete this goal?")) return;

    const { error } = await db
      .from("daily_goals")
      .delete()
      .eq("id", id)
      .eq("user_id", currentUser.id);

    if (error) {
      showToast(error.message);
      return;
    }

    await loadWorkspace();
    renderDashboard();

    showToast("Goal deleted.");
  }

  function calculateStreak() {
    const dates = [
      ...new Set(
        goals
          .filter(goal => goal.done)
          .map(goal => goal.date)
      )
    ].sort().reverse();

    if (!dates.length) return 0;

    const cursor = new Date(today() + "T12:00:00");
    const latest = new Date(dates[0] + "T12:00:00");

    const difference = Math.round(
      (cursor - latest) / 86400000
    );

    if (difference > 1) return 0;

    let count = 0;

    for (const date of dates) {
      const expected = new Date(cursor);
      expected.setDate(cursor.getDate() - count);

      if (date === expected.toISOString().slice(0, 10)) {
        count++;
      } else {
        break;
      }
    }

    return count;
  }

  // ==========================================
  // 11. DASHBOARD AND ANALYTICS
  // ==========================================

  function renderLeaks() {
    const totals = {};

    tests.forEach(test => {
      (test.leaks || []).forEach(leak => {
        if (!leak.chapter || leak.marks <= 0) return;

        totals[leak.chapter] =
          (totals[leak.chapter] || 0) + leak.marks;
      });
    });

    const rows = Object.entries(totals)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 4);

    if (!rows.length) {
      return `
        <div class="empty-state">
          Add chapter-level test analysis to see where marks may be slipping.
        </div>
      `;
    }

    const max = rows[0][1];

    return rows.map(([chapter, marks]) => `
      <div class="leak-row">
        <b>${escapeHTML(chapter)}</b>
        <span>${marks} marks noted</span>
        <div class="leak-track">
          <i style="width:${Math.max(8, marks / max * 100)}%"></i>
        </div>
      </div>
    `).join("");
  }

  function renderNextFocus() {
    const totals = {};

    tests.forEach(test => {
      (test.leaks || []).forEach(leak => {
        totals[leak.chapter] =
          (totals[leak.chapter] || 0) + leak.marks;
      });
    });

    const weakest = Object.entries(totals)
      .sort((a, b) => b[1] - a[1])[0];

    if (!weakest) {
      $("#nextFocusText").textContent =
        "Add chapter-level marks lost to calculate a useful next focus.";

      $("#nextFocusTag").textContent =
        "AWAITING CHAPTER DATA";

      return;
    }

    $("#nextFocusText").textContent =
      `${weakest[0]} has the highest recorded marks lost ` +
      `(${weakest[1]} marks across your entries). Consider reviewing it.`;

    $("#nextFocusTag").textContent =
      "BASED ON YOUR ENTRIES";
  }

  function renderChart() {
    const canvas = $("#scoreChart");
    const empty = $("#chartEmpty");

    if (!canvas || !empty) return;

    const sorted = [...tests].sort(
      (a, b) => a.date.localeCompare(b.date)
    );

    if (!sorted.length) {
      empty.classList.add("visible");

      if (chart) {
        chart.destroy();
        chart = null;
      }

      return;
    }

    empty.classList.remove("visible");

    if (typeof Chart === "undefined") {
      empty.textContent =
        "Chart library could not load. Check your internet connection.";
      empty.classList.add("visible");
      return;
    }

    const css = getComputedStyle(document.body);

    const textColor = css.getPropertyValue("--muted").trim();
    const gridColor = css.getPropertyValue("--line").trim();

    if (chart) chart.destroy();

    chart = new Chart(canvas, {
      type: "line",

      data: {
        labels: sorted.map(test =>
          new Date(test.date + "T12:00:00")
            .toLocaleDateString(undefined, {
              month: "short",
              day: "numeric"
            })
        ),

        datasets: [{
          label: "Score",
          data: sorted.map(test => test.score),
          borderColor: "#7694ff",
          backgroundColor: "rgba(105,139,255,.13)",
          fill: true,
          tension: 0.36,
          borderWidth: 2.5,
          pointRadius: 4
        }]
      },

      options: {
        responsive: true,
        maintainAspectRatio: false,

        plugins: {
          legend: { display: false }
        },

        scales: {
          x: {
            grid: { display: false },
            ticks: { color: textColor }
          },

          y: {
            beginAtZero: true,
            grid: { color: gridColor },
            ticks: { color: textColor }
          }
        }
      }
    });
  }

  function renderGoals() {
    const completed = goals.filter(goal => goal.done).length;

    $("#plannerDate").textContent =
      new Date().toLocaleDateString(undefined, {
        weekday: "long",
        month: "long",
        day: "numeric"
      });

    $("#goalCompletion").textContent =
      `${completed} / ${goals.length} DONE`;

    $("#goalsList").innerHTML = goals.length
      ? goals.map(goal => `
          <div class="goal-row ${goal.done ? "done" : ""}">
            <input
              type="checkbox"
              data-goal="${goal.id}"
              ${goal.done ? "checked" : ""}
              aria-label="Complete goal"
            />

            <span>${escapeHTML(goal.text)}</span>

            <button
              class="goal-delete"
              data-delete-goal="${goal.id}"
              aria-label="Delete goal"
            >×</button>
          </div>
        `).join("")
      : `
        <div class="empty-state">
          No goals yet. Add one small action above.
        </div>
      `;

    $$("[data-goal]", $("#goalsList")).forEach(input => {
      input.addEventListener("change", () =>
        toggleGoal(input.dataset.goal, input.checked)
      );
    });

    $$("[data-delete-goal]").forEach(button => {
      button.addEventListener("click", () =>
        deleteGoal(button.dataset.deleteGoal)
      );
    });

    $("#plannerStreak").textContent = calculateStreak();
    $("#streakValue").textContent = calculateStreak();
  }

  function renderGoalPreview() {
    const preview = $("#goalPreview");

    const todaysGoals = goals
      .filter(goal => goal.date === today())
      .slice(0, 3);

    preview.innerHTML = todaysGoals.length
      ? todaysGoals.map(goal => `
          <label class="goal-item ${goal.done ? "done" : ""}">
            <input
              type="checkbox"
              data-preview-goal="${goal.id}"
              ${goal.done ? "checked" : ""}
            />
            <span>${escapeHTML(goal.text)}</span>
          </label>
        `).join("")
      : `
        <div class="empty-state">
          No goals for today. Add one in Daily goals.
        </div>
      `;

    $$("[data-preview-goal]").forEach(input => {
      input.addEventListener("change", () =>
        toggleGoal(input.dataset.previewGoal, input.checked)
      );
    });
  }

  // ==========================================
  // 12. TEST HISTORY
  // ==========================================

  function renderTests() {
    const list = $("#testsList");
    if (!list) return;

    const query = ($("#testSearch")?.value || "")
      .trim()
      .toLowerCase();

    const filtered = [...tests]
      .sort((a, b) => b.date.localeCompare(a.date))
      .filter(test => {
        const content = [
          test.name,
          test.type,
          ...(test.leaks || []).map(leak => leak.chapter),
          ...(test.subjectScores || []).map(item => item.subject)
        ].join(" ").toLowerCase();

        return content.includes(query);
      });

    $("#testCount").textContent =
      `${tests.length} TEST${tests.length === 1 ? "" : "S"}`;

    list.innerHTML = filtered.length
      ? filtered.map(test => `
          <div class="test-row">
            <div class="test-main">
              <b>${escapeHTML(test.name)}</b>
              <span>
                ${new Date(test.date + "T12:00:00")
                  .toLocaleDateString(undefined, {
                    day: "numeric",
                    month: "short",
                    year: "numeric"
                  })}
              </span>
            </div>

            <div class="test-score">
              ${test.score}
              <small> / ${test.max}</small>
            </div>

            <div class="test-meta">
              ${Math.round(test.score / test.max * 100)}% score
            </div>

            <div class="test-type">
              ${escapeHTML(test.type)}
            </div>

            <button
              class="delete-test"
              data-delete-test="${test.id}"
              aria-label="Delete test"
            >×</button>
          </div>
        `).join("")
      : `
        <div class="empty-state">
          No matching tests found.
        </div>
      `;

    $$("[data-delete-test]").forEach(button => {
      button.addEventListener("click", () =>
        deleteTest(button.dataset.deleteTest)
      );
    });
  }

  async function deleteTest(id) {
    if (!confirm("Delete this test result and its analysis?")) {
      return;
    }

    const { error } = await db
      .from("tests")
      .delete()
      .eq("id", id)
      .eq("user_id", currentUser.id);

    if (error) {
      showToast(error.message);
      return;
    }

    await loadWorkspace();
    renderDashboard();

    showToast("Test deleted.");
  }

  function exportTests() {
    if (!tests.length) {
      showToast("There are no tests to export.");
      return;
    }

    const rows = [
      [
        "Test Name",
        "Date",
        "Type",
        "Score",
        "Maximum",
        "Percentage",
        "Subject",
        "Chapter",
        "Marks Lost"
      ]
    ];

    tests.forEach(test => {
      if (!test.leaks.length) {
        rows.push([
          test.name,
          test.date,
          test.type,
          test.score,
          test.max,
          (test.score / test.max * 100).toFixed(2),
          "",
          "",
          ""
        ]);
      } else {
        test.leaks.forEach(leak => {
          rows.push([
            test.name,
            test.date,
            test.type,
            test.score,
            test.max,
            (test.score / test.max * 100).toFixed(2),
            leak.subject,
            leak.chapter,
            leak.marks
          ]);
        });
      }
    });

    const csv = rows.map(row =>
      row.map(value => {
        let text = String(value ?? "");

        // Protect spreadsheet cells against formula injection.
        if (/^[=+\-@\t\r]/.test(text)) {
          text = "'" + text;
        }

        return `"${text.replace(/"/g, '""')}"`;
      }).join(",")
    ).join("\n");

    const blob = new Blob(
      ["\uFEFF" + csv],
      { type: "text/csv;charset=utf-8;" }
    );

    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");

    anchor.href = url;
    anchor.download = "scoresense-test-history.csv";
    anchor.click();

    URL.revokeObjectURL(url);
  }

  // ==========================================
  // 13. RENDER DASHBOARD
  // ==========================================

  function renderDashboard() {
    if (!profile || !examProfile) return;

    const name = profile.full_name || "Student";
    const target = Number(examProfile.target_score);
    const maximum = Number(examProfile.maximum_score);

    const sorted = [...tests].sort(
      (a, b) => a.date.localeCompare(b.date)
    );

    const latest = sorted.at(-1);
    const current = latest ? latest.score : 0;

    const percentage = target
      ? Math.min(100, Math.round(current / target * 100))
      : 0;

    const hour = new Date().getHours();

    const greeting =
      hour < 12 ? "morning" :
      hour < 17 ? "afternoon" :
      "evening";

    $("#welcomeTitle").innerHTML =
      `Good ${greeting}, ${escapeHTML(name)} <span>✦</span>`;

    $("#headerName").textContent = name;
    $("#profileInitial").textContent =
      name.charAt(0).toUpperCase();

    $("#targetScoreValue").textContent = target;
    $("#targetTotal").textContent = target;
    $("#examLabel").textContent =
      `${profile.education_stage} · ${examProfile.exam_type}`;

    $("#latestScoreValue").textContent =
      latest ? latest.score : "—";

    $("#latestTestLabel").textContent =
      latest ? latest.name : "Add your first test";

    $("#trendPill").textContent =
      sorted.length > 1
        ? (
            current >= sorted.at(-2).score
              ? "↗ UP"
              : "↘ DOWN"
          )
        : "START";

    $("#targetProgressValue").textContent =
      percentage + "%";

    $("#marksRemaining").textContent =
      latest
        ? `${Math.max(0, target - current)} marks to target`
        : "Add a test to begin";

    $("#targetProgressBar").style.width =
      percentage + "%";

    $("#targetCurrent").textContent = current;
    $("#targetPercentText").textContent =
      percentage + "% completed";

    $("#needMarks").textContent =
      `${Math.max(0, target - current)} to go`;

    $("#largeProgressBar").style.width =
      percentage + "%";

    $("#streakValue").textContent = calculateStreak();
    $("#plannerStreak").textContent = calculateStreak();

    $("#todayLabel").textContent =
      new Date().toLocaleDateString(undefined, {
        weekday: "short",
        month: "short",
        day: "numeric"
      });

    $("#leaksList").innerHTML = renderLeaks();

    renderNextFocus();
    renderGoals();
    renderGoalPreview();
    renderTests();
    renderChart();
  }

  // ==========================================
  // 14. NAVIGATION AND MODALS
  // ==========================================

  function navigate(page) {
    const pages = {
      overview: "Overview",
      tests: "My tests",
      planner: "Daily goals"
    };

    Object.keys(pages).forEach(key => {
      $("#" + key + "Page")?.classList.toggle(
        "hidden",
        key !== page
      );
    });

    $$(".side-link[data-page]").forEach(button => {
      button.classList.toggle(
        "active",
        button.dataset.page === page
      );
    });

    $("#breadcrumbPage").textContent =
      pages[page] || "Overview";

    $("#sidebar")?.classList.remove("open");

    if (page === "overview") {
      setTimeout(renderChart, 50);
    }
  }

  function openModal(id) {
    $("#" + id)?.classList.remove("hidden");
  }

  function closeModals() {
    $$(".modal-backdrop").forEach(modal => {
      modal.classList.add("hidden");
    });
  }

  function openTestModal() {
    resetTestForm();
    openModal("testModal");
  }

  function openProfile() {
    $("#profileName").value = profile?.full_name || "";
    $("#profileClass").value =
      profile?.education_stage || "Class 11";

    $("#profileExam").value =
      examProfile?.exam_type || "JEE Main";

    $("#profileTarget").value =
      examProfile?.target_score || 220;

    if ($("#profileTargetMax")) {
      $("#profileTargetMax").value =
        examProfile?.maximum_score || 300;
    }

    openModal("profileModal");
  }

  function showApp() {
    if (!currentUser) return;

    showView("appView");

    renderDashboard();
    navigate("overview");
  }

  // ==========================================
  // 15. EVENT LISTENERS
  // ==========================================

  function bindEvents() {
    $("#navGetStarted")?.addEventListener("click", startAuth);
    $("#heroGetStarted")?.addEventListener("click", startAuth);

    $("#backToLanding")?.addEventListener("click", () => {
      showView("landingView");
    });

    $("#authModeToggle")?.addEventListener("click", () => {
      setAuthMode(
        authMode === "signup" ? "login" : "signup"
      );
    });

    $("#authForm")?.addEventListener("submit", handleAuth);
        setupAuthExtras();

    $("#logoutButton")?.addEventListener("click", logout);

    $$("[data-theme-toggle]").forEach(button => {
      button.addEventListener("click", () => {
        setTheme(
          document.body.classList.contains("light")
            ? "dark"
            : "light"
        );
      });
    });

    $$(".side-link[data-page]").forEach(button => {
      button.addEventListener("click", () => {
        navigate(button.dataset.page);
      });
    });

    $$("[data-page]").forEach(button => {
      button.addEventListener("click", () => {
        navigate(button.dataset.page);
      });
    });

    $("#mobileMenu")?.addEventListener("click", () => {
      $("#sidebar")?.classList.toggle("open");
    });

    $("#editProfileButton")?.addEventListener(
      "click",
      openProfile
    );

    $("#editTarget")?.addEventListener(
      "click",
      openProfile
    );

    $("#profileForm")?.addEventListener(
      "submit",
      updateProfileFromForm
    );

    $("#createTestTop")?.addEventListener(
      "click",
      openTestModal
    );

    $("#createTestButton")?.addEventListener(
      "click",
      openTestModal
    );

    // Delegated event: works even though the empty-state
    // button is hidden/re-rendered dynamically.
    $("#chartEmpty")?.addEventListener("click", event => {
      if (event.target.closest("#chartCreateTest")) {
        openTestModal();
      }
    });

    $("#leakSubject")?.addEventListener(
      "change",
      updateChapterSuggestions
    );

    $("#addLeak")?.addEventListener(
      "click",
      addLeakInput
    );

    $("#testForm")?.addEventListener(
      "submit",
      createTest
    );

    $("#goalForm")?.addEventListener(
      "submit",
      addGoal
    );

    $("#testSearch")?.addEventListener(
      "input",
      renderTests
    );

    $("#exportTests")?.addEventListener(
      "click",
      exportTests
    );

    $("#newQuote")?.addEventListener("click", () => {
      $("#dashboardQuote").textContent = randomQuote();
    });

    $$("[data-close-modal]").forEach(button => {
      button.addEventListener("click", closeModals);
    });

    $$(".modal-backdrop").forEach(backdrop => {
      backdrop.addEventListener("click", event => {
        if (event.target === backdrop) {
          closeModals();
        }
      });
    });

    document.addEventListener("keydown", event => {
      if (event.key === "Escape") closeModals();
    });
  }

 
  // ==========================================
  // 16. APP STARTUP
  // ==========================================

  async function init() {
    // Apply saved theme
    setTheme(
      localStorage.getItem(KEYS.theme) || "dark"
    );

    updateQuote();
    bindEvents();

    if ($("#testDate")) {
      $("#testDate").value = today();
    }

    setAuthMode("signup");

    // Listen for authentication changes
    db.auth.onAuthStateChange((event, session) => {
      if (event === "PASSWORD_RECOVERY") {
        showPasswordRecovery();
        return;
      }

      if (event === "SIGNED_OUT") {
        currentUser = null;
        profile = null;
        examProfile = null;
        tests = [];
        goals = [];

        showView("landingView");
        return;
      }

      if (
        event === "SIGNED_IN" ||
        event === "USER_UPDATED"
      ) {
        if (!session) return;

        setTimeout(async () => {
          try {
            await loadWorkspace();

            if (profile && examProfile) {
              showApp();
            } else {
              showView("authView");
              showToast(
                "Complete your student profile to continue."
              );
            }
          } catch (error) {
            console.error("Auth event error:", error);
            showToast("Could not load your account.");
          }
        }, 0);
      }
    });

    try {
      const { data, error } = await db.auth.getSession();

      if (error) throw error;

      if (!data.session) {
        showView("landingView");
        return;
      }

      await loadWorkspace();
      await importLegacyDataIfAvailable();

      if (profile && examProfile) {
        showApp();
      } else {
        showView("authView");
      }

    } catch (error) {
      console.error("Startup error:", error);

      showView("landingView");

      showToast(
        "Could not load your account. Please log in again."
      );
    }
  }

  init();

})();
