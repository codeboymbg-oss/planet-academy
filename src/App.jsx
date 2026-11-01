
import { useState, useEffect } from "react";

const STORAGE_KEY = "planet-academy-profiles";

const planets = [
  {
    name: "Mercury", emoji: "☿️", type: "Terrestrial planet",
    facts: [
      "Mercury is closest to the Sun.",
      "It is the smallest planet.",
      "A year lasts 88 Earth days.",
      "It has a heavily cratered surface."
    ]
  },
  {
    name: "Venus", emoji: "🟡", type: "Terrestrial planet",
    facts: [
      "Venus is the second planet.",
      "It is the hottest planet.",
      "Its atmosphere is mostly carbon dioxide.",
      "It rotates backwards compared with most planets."
    ]
  },
  {
    name: "Earth", emoji: "🌍", type: "Terrestrial planet",
    facts: [
      "Earth is the third planet.",
      "Earth has one natural moon.",
      "About 71% of Earth is covered by water.",
      "Earth is the only known planet with life."
    ]
  },
  {
    name: "Mars", emoji: "🔴", type: "Terrestrial planet",
    facts: [
      "Mars is called the Red Planet.",
      "It has two moons: Phobos and Deimos.",
      "Olympus Mons is a giant volcano.",
      "Scientists explore Mars with robotic rovers."
    ]
  },
  {
    name: "Jupiter", emoji: "🟠", type: "Gas giant",
    facts: [
      "Jupiter is the largest planet.",
      "It has the Great Red Spot.",
      "Jupiter has a faint ring system.",
      "Ganymede is larger than Mercury."
    ]
  },
  {
    name: "Saturn", emoji: "🪐", type: "Gas giant",
    facts: [
      "Saturn is famous for its rings.",
      "Its rings contain ice and rocky particles.",
      "Titan is its largest moon.",
      "Saturn is the least dense planet on average."
    ]
  },
  {
    name: "Uranus", emoji: "🔵", type: "Ice giant",
    facts: [
      "Uranus rotates on its side.",
      "It is an ice giant.",
      "Its atmosphere contains methane.",
      "A year lasts about 84 Earth years."
    ]
  },
  {
    name: "Neptune", emoji: "🔷", type: "Ice giant",
    facts: [
      "Neptune is the eighth planet.",
      "It has extremely fast winds.",
      "Triton is its largest moon.",
      "A Neptune year lasts about 165 Earth years."
    ]
  }
];

const questions = [
  {
    question: "Which planet is closest to the Sun?",
    answers: ["Earth", "Venus", "Mercury", "Mars"],
    correct: "Mercury"
  },
  {
    question: "Which planet is the hottest?",
    answers: ["Mercury", "Venus", "Mars", "Jupiter"],
    correct: "Venus"
  },
  {
    question: "Which is the largest planet?",
    answers: ["Saturn", "Jupiter", "Neptune", "Earth"],
    correct: "Jupiter"
  },
  {
    question: "Which planet has the famous Great Red Spot?",
    answers: ["Mars", "Earth", "Jupiter", "Saturn"],
    correct: "Jupiter"
  },
  {
    question: "Which planet rotates on its side?",
    answers: ["Uranus", "Neptune", "Venus", "Mercury"],
    correct: "Uranus"
  },
  {
    question: "What are Mars's two moons?",
    answers: [
      "Io and Europa",
      "Phobos and Deimos",
      "Titan and Rhea",
      "Triton and Nereid"
    ],
    correct: "Phobos and Deimos"
  },
  {
    question: "Which planet is famous for its rings?",
    answers: ["Saturn", "Earth", "Venus", "Mars"],
    correct: "Saturn"
  },
  {
    question: "How many planets are in our Solar System?",
    answers: ["7", "8", "9", "10"],
    correct: "8"
  }
];

function makeId() {
  return globalThis.crypto?.randomUUID?.() ??
    `${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

function makeProfile(username) {
  return {
    id: makeId(),
    username: username.trim(),
    xp: 0,
    learned: [],
    correctAnswers: 0
  };
}

function loadProfiles() {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY));

    if (saved && Array.isArray(saved.profiles)) {
      return saved;
    }

    // Import an older single-player save if one exists.
    const oldPlayer = JSON.parse(
      localStorage.getItem("planet-academy")
    );

    if (oldPlayer?.username) {
      const profile = {
        ...makeProfile(oldPlayer.username),
        ...oldPlayer,
        id: makeId(),
        learned: Array.isArray(oldPlayer.learned)
          ? oldPlayer.learned
          : []
      };

      return {
        profiles: [profile],
        activeId: profile.id
      };
    }
  } catch (error) {
    console.error("Could not load profiles:", error);
  }

  return {
    profiles: [],
    activeId: null
  };
}

export default function App() {
  const [savedData, setSavedData] = useState(loadProfiles);

  const [username, setUsername] = useState("");
  const [page, setPage] = useState("profiles");
  const [selectedPlanet, setSelectedPlanet] = useState(null);

  const [questionIndex, setQuestionIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [answered, setAnswered] = useState(false);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [finished, setFinished] = useState(false);

  const player = savedData.profiles.find(
    p => p.id === savedData.activeId
  ) || null;

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(savedData));
  }, [savedData]);

  function createProfile(e) {
    e.preventDefault();

    if (!username.trim()) return;

    const newProfile = makeProfile(username);

    setSavedData(old => ({
      profiles: [...old.profiles, newProfile],
      activeId: newProfile.id
    }));

    setUsername("");
    setPage("home");
  }

  function switchProfile(id) {
    setSavedData(old => ({
      ...old,
      activeId: id
    }));

    setSelectedPlanet(null);
    setPage("home");
  }

  function openProfileSelection() {
    setSavedData(old => ({
      ...old,
      activeId: null
    }));

    setSelectedPlanet(null);
    setPage("profiles");
  }

  function deleteProfile(id) {
    const target = savedData.profiles.find(p => p.id === id);

    if (!target) return;

    if (!confirm(`Delete ${target.username}'s profile and all its progress?`)) {
      return;
    }

    setSavedData(old => {
      const remaining = old.profiles.filter(p => p.id !== id);

      return {
        profiles: remaining,
        activeId:
          old.activeId === id ? null : old.activeId
      };
    });

    setPage("profiles");
  }

  function updatePlayer(callback) {
    setSavedData(old => ({
      ...old,
      profiles: old.profiles.map(p =>
        p.id === old.activeId ? callback(p) : p
      )
    }));
  }

  function learnPlanet(name) {
    if (!player || player.learned.includes(name)) return;

    updatePlayer(old => ({
      ...old,
      learned: [...old.learned, name],
      xp: old.xp + 20
    }));
  }

  function startQuiz() {
    setQuestionIndex(0);
    setScore(0);
    setAnswered(false);
    setSelectedAnswer(null);
    setFinished(false);
    setPage("quiz");
  }

  function answerQuestion(answer) {
    if (answered) return;

    setSelectedAnswer(answer);
    setAnswered(true);

    if (answer === questions[questionIndex].correct) {
      setScore(old => old + 1);
    }
  }

  function nextQuestion() {
    if (questionIndex < questions.length - 1) {
      setQuestionIndex(old => old + 1);
      setAnswered(false);
      setSelectedAnswer(null);
    } else {
      updatePlayer(old => ({
        ...old,
        xp: old.xp + score * 10,
        correctAnswers: old.correctAnswers + score
      }));

      setFinished(true);
    }
  }

  function resetProgress() {
    if (!player) return;

    if (confirm("Reset all your progress?")) {
      updatePlayer(old => ({
        ...old,
        xp: 0,
        learned: [],
        correctAnswers: 0
      }));
    }
  }

  // PROFILE SELECTION SCREEN
  if (!player) {
    return (
      <div className="welcome">
        <div className="welcome-card">
          <h1>🪐 Planet Academy</h1>
          <p>Choose your explorer profile!</p>

          {savedData.profiles.length > 0 && (
            <div>
              <h2>👥 Existing profiles</h2>

              {savedData.profiles.map(profile => (
                <div className="panel" key={profile.id}>
                  <h3>👤 {profile.username}</h3>
                  <p>⭐ {profile.xp} XP</p>
                  <p>🪐 {profile.learned.length}/8 planets learned</p>

                  <button onClick={() => switchProfile(profile.id)}>
                    SELECT PROFILE 🚀
                  </button>

                  <button onClick={() => deleteProfile(profile.id)}>
                    🗑️ DELETE
                  </button>
                </div>
              ))}
            </div>
          )}

          <h2>✨ Create a new explorer</h2>

          <form onSubmit={createProfile}>
            <input
              value={username}
              onChange={e => setUsername(e.target.value)}
              placeholder="Your username..."
              maxLength={20}
              required
            />

            <button type="submit">
              CREATE PROFILE 🚀
            </button>
          </form>
        </div>
      </div>
    );
  }

  const level = Math.floor(player.xp / 100) + 1;

  return (
    <div className="app">
      <header>
        <h1>🪐 Planet Academy</h1>
        <p>Explorer: {player.username}</p>
      </header>

      <nav>
        <button onClick={() => setPage("home")}>Home</button>
        <button onClick={() => setPage("planets")}>Planets</button>
        <button onClick={startQuiz}>Quiz</button>
        <button onClick={() => setPage("profile")}>Profile</button>
        <button onClick={openProfileSelection}>
          👥 Switch Profile
        </button>
      </nav>

      <main>
        {page === "home" && (
          <section className="panel">
            <h2>Welcome back, {player.username}! 🚀</h2>

            <div className="stats">
              <div>⭐ {player.xp} XP</div>
              <div>🏆 Level {level}</div>
              <div>🪐 {player.learned.length}/8 planets</div>
            </div>

            <h3>Your mission</h3>
            <p>Explore all eight planets and become a Solar System expert!</p>

            <button onClick={() => setPage("planets")}>
              EXPLORE PLANETS
            </button>

            <button onClick={startQuiz}>
              TAKE QUIZ
            </button>
          </section>
        )}

        {page === "planets" && (
          <section>
            <h2>🌌 Planet library</h2>

            <div className="planet-grid">
              {planets.map(planet => (
                <button
                  className="planet-card"
                  key={planet.name}
                  onClick={() => {
                    setSelectedPlanet(planet);
                    setPage("lesson");
                  }}
                >
                  <span>{planet.emoji}</span>
                  <h3>{planet.name}</h3>
                  <p>{planet.type}</p>

                  <small>
                    {player.learned.includes(planet.name)
                      ? "✅ Learned"
                      : "📖 Explore"}
                  </small>
                </button>
              ))}
            </div>
          </section>
        )}

        {page === "lesson" && selectedPlanet && (
          <section className="panel">
            <button onClick={() => setPage("planets")}>
              ← Back
            </button>

            <h2>
              {selectedPlanet.emoji} {selectedPlanet.name}
            </h2>

            <h3>{selectedPlanet.type}</h3>
            <h3>Interesting facts</h3>

            {selectedPlanet.facts.map((fact, i) => (
              <div className="fact" key={i}>
                {fact}
              </div>
            ))}

            <button
              disabled={player.learned.includes(selectedPlanet.name)}
              onClick={() => learnPlanet(selectedPlanet.name)}
            >
              {player.learned.includes(selectedPlanet.name)
                ? "Already learned ✓"
                : "MARK AS LEARNED +20 XP"}
            </button>
          </section>
        )}

        {page === "quiz" && (
          <section className="panel">
            <h2>🧠 Planet quiz</h2>

            {!finished ? (
              <>
                <p>
                  Question {questionIndex + 1} / {questions.length}
                </p>

                <h3>{questions[questionIndex].question}</h3>

                {questions[questionIndex].answers.map(answer => (
                  <button
                    className="answer"
                    key={answer}
                    disabled={answered}
                    onClick={() => answerQuestion(answer)}
                  >
                    {answer}
                  </button>
                ))}

                {answered && (
                  <>
                    <p>
                      {selectedAnswer === questions[questionIndex].correct
                        ? "✅ Correct! Excellent work!"
                        : `❌ Not quite! The answer is ${questions[questionIndex].correct}.`}
                    </p>

                    <button onClick={nextQuestion}>
                      {questionIndex === questions.length - 1
                        ? "FINISH QUIZ"
                        : "NEXT QUESTION →"}
                    </button>
                  </>
                )}
              </>
            ) : (
              <>
                <h2>🏆 Quiz completed!</h2>
                <h1>{score}/{questions.length}</h1>
                <p>You earned {score * 10} XP!</p>
                <button onClick={startQuiz}>TRY AGAIN</button>
                <button onClick={() => setPage("home")}>
                  HOME
                </button>
              </>
            )}
          </section>
        )}

        {page === "profile" && (
          <section className="panel">
            <h2>👤 Explorer profile</h2>
            <h3>{player.username}</h3>

            <div className="stats">
              <div>⭐ {player.xp} XP</div>
              <div>🏆 Level {level}</div>
              <div>🪐 {player.learned.length}/8</div>
            </div>

            <h3>Achievements</h3>

            <div className="fact">
              {player.learned.length >= 1
                ? "🏆 First planet discovered!"
                : "🔒 Discover your first planet"}
            </div>

            <div className="fact">
              {player.learned.length >= 4
                ? "🏆 Planet explorer!"
                : "🔒 Learn four planets"}
            </div>

            <div className="fact">
              {player.learned.length === 8
                ? "🏆 SOLAR SYSTEM MASTER!"
                : "🔒 Learn all eight planets"}
            </div>

            <p>Correct quiz answers: {player.correctAnswers}</p>

            <button onClick={resetProgress}>
              RESET PROGRESS
            </button>

            <button onClick={openProfileSelection}>
              SWITCH PROFILE
            </button>
          </section>
        )}
      </main>

      <footer>
        PLANET ACADEMY · EXPLORE THE UNIVERSE 🌌
      </footer>
    </div>
  );
}
