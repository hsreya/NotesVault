import React, { useState, useRef, useEffect, useCallback } from 'react';
import './Chatbot.css';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5127';

// ─── Smart Keyword Parser ────────────────────────────────────────────────────
const SUBJECT_MAP = {
  'dbms': 'DBMS', 'database': 'DBMS', 'db': 'DBMS',
  'os': 'OS', 'operating system': 'OS', 'operating systems': 'OS',
  'cn': 'CN', 'computer network': 'CN', 'computer networks': 'CN', 'networking': 'CN',
  'dsa': 'DSA', 'data structure': 'DSA', 'data structures': 'DSA', 'algorithms': 'DSA',
  'web dev': 'Web Dev', 'web development': 'Web Dev', 'react': 'Web Dev', 'javascript': 'Web Dev', 'html': 'Web Dev',
  'ai': 'AI/ML', 'ml': 'AI/ML', 'ai/ml': 'AI/ML', 'machine learning': 'AI/ML', 'artificial intelligence': 'AI/ML',
  'math': 'Math', 'maths': 'Math', 'mathematics': 'Math', 'engineering math': 'Math',
  'physics': 'Physics', 'phy': 'Physics',
  'chemistry': 'Chemistry', 'chem': 'Chemistry',
  'digital logic': 'Digital Logic', 'dld': 'Digital Logic',
  'computer architecture': 'Computer Architecture', 'coa': 'Computer Architecture',
  'software engineering': 'Software Engineering', 'se': 'Software Engineering',
};

const TYPE_KEYWORDS = {
  'handwritten': 'Handwritten', 'hand written': 'Handwritten',
  'summary': 'Summary', 'short notes': 'Summary', 'short': 'Summary',
  'pyq': 'PYQ', 'previous year': 'PYQ', 'question paper': 'PYQ',
  'revision': 'Revision', 'quick revision': 'Revision',
  'lab manual': 'Lab Manual', 'lab': 'Lab Manual', 'practical': 'Lab Manual',
  'assignment': 'Assignment',
  'detailed': 'Detailed',
};

const SEMESTER_REGEX = /\b(?:sem(?:ester)?\s*(\d))\b/i;

function parseQuery(text) {
  const lower = text.toLowerCase().trim();
  const filters = { subject: '', semester: '', type: '', query: lower };

  // Extract semester
  const semMatch = lower.match(SEMESTER_REGEX);
  if (semMatch) filters.semester = `Sem ${semMatch[1]}`;

  // Extract subject (match longest first)
  const sortedSubjects = Object.keys(SUBJECT_MAP).sort((a, b) => b.length - a.length);
  for (const key of sortedSubjects) {
    if (lower.includes(key)) {
      filters.subject = SUBJECT_MAP[key];
      break;
    }
  }

  // Extract type
  const sortedTypes = Object.keys(TYPE_KEYWORDS).sort((a, b) => b.length - a.length);
  for (const key of sortedTypes) {
    if (lower.includes(key)) {
      filters.type = TYPE_KEYWORDS[key];
      break;
    }
  }

  return filters;
}

// ─── Subject Knowledge Base (2-3 line answers) ──────────────────────────────
const KNOWLEDGE_BASE = [
  // DBMS
  { patterns: ['what is dbms', 'define dbms', 'dbms meaning', 'explain dbms'], answer: '**DBMS (Database Management System)** is software that stores, retrieves, and manages data in databases. It provides an interface between users and the database, ensuring data integrity, security, and efficient access. Examples include MySQL, PostgreSQL, and MongoDB.' },
  { patterns: ['what is normalization', 'explain normalization', 'normalization in dbms'], answer: '**Normalization** is the process of organizing data in a database to reduce redundancy and improve data integrity. It involves dividing large tables into smaller ones and defining relationships between them. Common forms are 1NF, 2NF, 3NF, and BCNF.' },
  { patterns: ['what is sql', 'explain sql', 'define sql'], answer: '**SQL (Structured Query Language)** is a standard programming language used to manage and manipulate relational databases. It supports operations like querying (SELECT), inserting (INSERT), updating (UPDATE), and deleting (DELETE) data from tables.' },
  { patterns: ['what is acid', 'acid properties', 'explain acid'], answer: '**ACID** stands for Atomicity, Consistency, Isolation, and Durability. These are properties that guarantee reliable database transactions. They ensure that operations are completed fully, maintain data validity, run independently, and persist even after system failures.' },
  { patterns: ['what is er diagram', 'explain er model', 'entity relationship'], answer: '**ER (Entity-Relationship) Diagram** is a visual representation of entities and their relationships in a database. It uses rectangles for entities, diamonds for relationships, and ovals for attributes, helping in database design and planning.' },
  { patterns: ['what is join', 'types of join', 'sql join', 'explain joins'], answer: '**Joins** in SQL combine rows from two or more tables based on related columns. Types include INNER JOIN (matching rows), LEFT JOIN (all left + matching right), RIGHT JOIN (all right + matching left), and FULL OUTER JOIN (all rows from both tables).' },

  // OS
  { patterns: ['what is os', 'what is operating system', 'define os', 'explain operating system'], answer: '**Operating System (OS)** is system software that manages computer hardware, software resources, and provides services for programs. It acts as an intermediary between users and hardware. Examples include Windows, Linux, macOS, and Android.' },
  { patterns: ['what is deadlock', 'explain deadlock', 'deadlock in os'], answer: '**Deadlock** is a situation in OS where two or more processes are blocked forever, each waiting for a resource held by the other. It occurs when four conditions are met simultaneously: mutual exclusion, hold and wait, no preemption, and circular wait.' },
  { patterns: ['what is process', 'process vs thread', 'explain process'], answer: '**A Process** is a program in execution that has its own memory space, resources, and state. A **Thread** is a lightweight unit within a process that shares the same memory space. Multithreading allows concurrent execution within a single process.' },
  { patterns: ['what is paging', 'explain paging', 'paging in os'], answer: '**Paging** is a memory management scheme that eliminates the need for contiguous memory allocation. It divides physical memory into fixed-size blocks called frames and logical memory into pages of the same size, enabling efficient memory utilization.' },
  { patterns: ['what is scheduling', 'cpu scheduling', 'process scheduling'], answer: '**CPU Scheduling** determines which process runs on the CPU at any time. Common algorithms include FCFS (First Come First Served), SJF (Shortest Job First), Round Robin (time-sliced), and Priority Scheduling. It aims to maximize CPU utilization and minimize wait time.' },
  { patterns: ['what is semaphore', 'explain semaphore', 'mutex vs semaphore'], answer: '**Semaphore** is a synchronization tool used to control access to shared resources in concurrent programming. A **binary semaphore (mutex)** allows only one process, while a **counting semaphore** allows multiple processes up to a defined limit.' },

  // CN
  { patterns: ['what is cn', 'what is computer network', 'explain computer networks'], answer: '**Computer Networks** is the interconnection of multiple computing devices that can exchange data and share resources. Networks are classified by size as LAN (local), MAN (metropolitan), and WAN (wide area), using protocols like TCP/IP for communication.' },
  { patterns: ['what is tcp', 'tcp vs udp', 'explain tcp ip'], answer: '**TCP (Transmission Control Protocol)** is a connection-oriented protocol that ensures reliable, ordered data delivery between applications. Unlike **UDP** (connectionless, faster but unreliable), TCP uses handshaking, acknowledgments, and retransmission for reliability.' },
  { patterns: ['what is osi model', 'osi layers', 'explain osi'], answer: '**OSI Model** has 7 layers: Physical, Data Link, Network, Transport, Session, Presentation, and Application. Each layer handles specific networking functions, providing a standardized framework for network communication between different systems.' },
  { patterns: ['what is ip address', 'explain ip', 'ipv4 vs ipv6'], answer: '**IP Address** is a unique numerical label assigned to each device on a network. **IPv4** uses 32-bit addresses (e.g., 192.168.1.1), while **IPv6** uses 128-bit addresses to support the growing number of internet-connected devices.' },
  { patterns: ['what is dns', 'explain dns', 'domain name system'], answer: '**DNS (Domain Name System)** translates human-readable domain names (like google.com) into IP addresses that computers use to identify each other on the network. It acts like a phonebook of the internet.' },
  { patterns: ['what is http', 'http vs https', 'explain http'], answer: '**HTTP (HyperText Transfer Protocol)** is the foundation of data communication on the web, defining how messages are formatted and transmitted. **HTTPS** adds SSL/TLS encryption for secure communication, protecting data from interception.' },

  // DSA
  { patterns: ['what is dsa', 'what is data structure', 'explain data structures'], answer: '**Data Structures & Algorithms (DSA)** is the study of organizing, storing, and processing data efficiently. Data structures (arrays, trees, graphs) define how data is stored, while algorithms (sorting, searching) define how it is processed.' },
  { patterns: ['what is linked list', 'explain linked list', 'types of linked list'], answer: '**Linked List** is a linear data structure where elements (nodes) are stored in non-contiguous memory, each pointing to the next. Types include Singly (one direction), Doubly (both directions), and Circular linked lists. It allows efficient insertion/deletion.' },
  { patterns: ['what is binary tree', 'explain binary tree', 'tree data structure'], answer: '**Binary Tree** is a hierarchical data structure where each node has at most two children (left and right). Special types include BST (ordered), AVL (self-balancing), and Heap (priority-based). Trees are used in databases, file systems, and searching.' },
  { patterns: ['what is graph', 'explain graph', 'graph data structure'], answer: '**Graph** is a non-linear data structure consisting of vertices (nodes) and edges (connections). Graphs can be directed/undirected and weighted/unweighted. They model real-world networks like social media, maps, and web pages.' },
  { patterns: ['what is sorting', 'sorting algorithms', 'types of sorting'], answer: '**Sorting** arranges data in a specific order. Common algorithms: **Bubble Sort** O(n²), **Merge Sort** O(n log n), **Quick Sort** O(n log n avg), and **Heap Sort** O(n log n). The best choice depends on data size and constraints.' },
  { patterns: ['what is stack', 'stack vs queue', 'explain stack'], answer: '**Stack** is a LIFO (Last In, First Out) data structure — like a stack of plates. **Queue** is FIFO (First In, First Out) — like a line at a counter. Stacks are used in undo operations and function calls; queues in scheduling and BFS.' },
  { patterns: ['time complexity', 'what is big o', 'explain big o notation'], answer: '**Big O Notation** describes the worst-case time/space complexity of an algorithm as input grows. Common complexities: O(1) constant, O(log n) logarithmic, O(n) linear, O(n log n) linearithmic, O(n²) quadratic. Lower is better for scalability.' },

  // Web Dev
  { patterns: ['what is web development', 'explain web dev', 'frontend vs backend'], answer: '**Web Development** is building websites and web applications. **Frontend** (HTML, CSS, JS, React) handles what users see. **Backend** (Node.js, Express, databases) handles server logic and data. Full-stack developers work on both.' },
  { patterns: ['what is react', 'explain react', 'reactjs'], answer: '**React** is a JavaScript library by Meta for building user interfaces using reusable components. It uses a Virtual DOM for efficient updates, JSX for templating, and hooks (useState, useEffect) for state management. It powers single-page applications.' },
  { patterns: ['what is api', 'explain api', 'rest api'], answer: '**API (Application Programming Interface)** allows different software systems to communicate. **REST APIs** use HTTP methods (GET, POST, PUT, DELETE) to perform CRUD operations on resources, typically exchanging data in JSON format.' },

  // AI/ML
  { patterns: ['what is ai', 'what is artificial intelligence', 'explain ai'], answer: '**Artificial Intelligence (AI)** is the simulation of human intelligence by computer systems. It includes learning from data, recognizing patterns, making decisions, and natural language processing. Applications include chatbots, self-driving cars, and recommendation systems.' },
  { patterns: ['what is machine learning', 'explain ml', 'what is ml'], answer: '**Machine Learning (ML)** is a subset of AI where systems learn from data without being explicitly programmed. Types include Supervised (labeled data), Unsupervised (finding patterns), and Reinforcement Learning (reward-based learning).' },
  { patterns: ['what is neural network', 'explain neural networks', 'deep learning'], answer: '**Neural Networks** are computing systems inspired by the human brain, consisting of layers of interconnected nodes (neurons). **Deep Learning** uses multi-layered neural networks to process complex patterns in images, text, and speech.' },

  // Math
  { patterns: ['what is calculus', 'explain calculus'], answer: '**Calculus** is the mathematical study of continuous change. **Differential calculus** deals with rates of change (derivatives), while **Integral calculus** deals with accumulation of quantities (integrals). It is fundamental to engineering, physics, and economics.' },
  { patterns: ['what is linear algebra', 'explain linear algebra', 'matrices'], answer: '**Linear Algebra** studies vectors, matrices, and linear transformations. It is crucial in computer science for graphics, machine learning, and data science. Key concepts include matrix operations, eigenvalues, vector spaces, and determinants.' },
  { patterns: ['what is probability', 'explain probability', 'probability and statistics'], answer: '**Probability** measures the likelihood of events occurring, ranging from 0 (impossible) to 1 (certain). Combined with **Statistics** (data analysis), it forms the foundation for data science, ML algorithms, and engineering decision-making.' },

  // Physics
  { patterns: ['what is thermodynamics', 'explain thermodynamics', 'laws of thermodynamics'], answer: '**Thermodynamics** studies heat, energy, and work. Its four laws govern energy conservation, entropy increase, and absolute zero. It is essential in mechanical engineering, chemistry, and understanding engines, refrigerators, and natural processes.' },
  { patterns: ['what is quantum mechanics', 'explain quantum physics'], answer: '**Quantum Mechanics** describes the behavior of matter and energy at the atomic/subatomic level. Key concepts include wave-particle duality, uncertainty principle, and superposition. It underpins modern electronics, lasers, and quantum computing.' },

  // Software Engineering
  { patterns: ['what is sdlc', 'software development life cycle', 'explain sdlc'], answer: '**SDLC (Software Development Life Cycle)** is a structured process for developing software through phases: Planning, Analysis, Design, Implementation, Testing, Deployment, and Maintenance. Popular models include Waterfall, Agile, and Spiral.' },
  { patterns: ['what is agile', 'explain agile', 'agile methodology'], answer: '**Agile** is an iterative software development methodology that emphasizes flexibility, collaboration, and customer feedback. Work is done in short sprints (1-4 weeks), delivering incremental improvements. Scrum and Kanban are popular Agile frameworks.' },

  // General / Greetings
  { patterns: ['hi', 'hello', 'hey', 'hii', 'hola', 'sup'], answer: "Hey there! 👋 I'm your Notes Assistant. You can ask me to find notes (e.g., **\"DBMS sem 4\"**) or ask subject questions (e.g., **\"What is normalization?\"**). How can I help?" },
  { patterns: ['help', 'what can you do', 'how to use', 'commands'], answer: "I can help you with two things:\n\n1️⃣ **Find notes** — Try: \"DBMS notes\", \"sem 4 PYQ\", \"handwritten OS notes\"\n2️⃣ **Answer questions** — Try: \"What is normalization?\", \"Explain deadlock\", \"What is TCP?\"\n\nJust type your question!" },
  { patterns: ['thank', 'thanks', 'thank you', 'ty'], answer: "You're welcome! 😊 Happy studying! Let me know if you need anything else." },
];

// ─── Chatbot Component ───────────────────────────────────────────────────────
const Chatbot = ({ allNotes = [], onPreviewNote }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      role: 'bot',
      text: "Hey there! 👋 I'm your Notes Assistant. Ask me anything like **\"DBMS notes sem 4\"** or **\"handwritten OS notes\"** and I'll find them for you!",
      notes: [],
    }
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping, scrollToBottom]);

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  const searchNotes = useCallback(async (filters) => {
    // First search locally from allNotes
    let results = [...allNotes];
    const q = filters.query.toLowerCase();

    if (filters.subject) {
      results = results.filter(n =>
        (n.subject || n.branch || '').toLowerCase() === filters.subject.toLowerCase()
      );
    }

    if (filters.semester) {
      results = results.filter(n =>
        (n.semester || '').toLowerCase() === filters.semester.toLowerCase()
      );
    }

    if (filters.type) {
      results = results.filter(n =>
        (n.category || '').toLowerCase() === filters.type.toLowerCase() ||
        (n.tags || []).some(t => t.toLowerCase() === filters.type.toLowerCase()) ||
        (n.title || '').toLowerCase().includes(filters.type.toLowerCase()) ||
        (n.description || '').toLowerCase().includes(filters.type.toLowerCase())
      );
    }

    // If no specific filters matched, do a general text search
    if (!filters.subject && !filters.semester && !filters.type) {
      results = results.filter(n =>
        (n.title || '').toLowerCase().includes(q) ||
        (n.subject || n.branch || '').toLowerCase().includes(q) ||
        (n.description || '').toLowerCase().includes(q) ||
        (n.tags || []).some(t => t.toLowerCase().includes(q))
      );
    }

    // If local search found nothing, try the API as fallback
    if (results.length === 0) {
      try {
        const params = new URLSearchParams();
        if (filters.subject) params.append('subject', filters.subject);
        if (filters.semester) params.append('semester', filters.semester);
        params.append('search', filters.query);
        const res = await fetch(`${API_URL}/api/notes?${params.toString()}`);
        if (res.ok) {
          const data = await res.json();
          results = data.data || [];
        }
      } catch (err) {
        console.error('Chatbot API search failed:', err);
      }
    }

    return results.slice(0, 5); // Max 5 results
  }, [allNotes]);

  const handleSend = useCallback(async (text) => {
    const msg = (text || input).trim();
    if (!msg) return;

    // Add user message
    setMessages(prev => [...prev, { role: 'user', text: msg, notes: [] }]);
    setInput('');
    setIsTyping(true);

    // Simulate thinking delay
    await new Promise(r => setTimeout(r, 600 + Math.random() * 400));

    // 1. Check knowledge base for direct answers
    const lowerMsg = msg.toLowerCase();
    for (const kb of KNOWLEDGE_BASE) {
      if (kb.patterns.some(p => lowerMsg.includes(p))) {
        setIsTyping(false);
        setMessages(prev => [...prev, { role: 'bot', text: kb.answer, notes: [] }]);
        return;
      }
    }

    // 2. Fall back to searching notes
    // Parse query
    const filters = parseQuery(msg);
    const results = await searchNotes(filters);

    let reply;
    if (results.length > 0) {
      const parts = [];
      if (filters.subject) parts.push(filters.subject);
      if (filters.type) parts.push(filters.type.toLowerCase());
      if (filters.semester) parts.push(filters.semester);
      const desc = parts.length > 0 ? parts.join(' ') + ' ' : '';
      reply = `Found **${results.length} ${desc}note${results.length > 1 ? 's' : ''}** for you! 📚`;
    } else {
      reply = `Sorry, I couldn't find notes matching **"${msg}"** 😔\n\nTry different keywords like a subject name (DBMS, OS, CN) or semester (Sem 4).`;
    }

    setIsTyping(false);
    setMessages(prev => [...prev, { role: 'bot', text: reply, notes: results }]);
  }, [input, searchNotes]);

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const clearChat = () => {
    setMessages([
      {
        role: 'bot',
        text: "Chat cleared! 🧹 Ask me anything to find notes.",
        notes: [],
      }
    ]);
  };

  const suggestions = ['DBMS notes', 'Handwritten notes', 'Sem 4 PYQ', 'OS revision', 'DSA notes'];

  // Simple markdown bold parser
  const renderText = (text) => {
    const parts = text.split(/\*\*(.*?)\*\*/g);
    return parts.map((part, i) =>
      i % 2 === 1 ? <strong key={i}>{part}</strong> : part
    );
  };

  return (
    <>
      {/* Floating Button */}
      <button
        className={`chatbot-fab ${!isOpen ? 'chatbot-fab--pulse' : ''}`}
        onClick={() => setIsOpen(o => !o)}
        title="Notes Assistant"
        id="chatbot-toggle"
      >
        {isOpen ? (
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        ) : (
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
          </svg>
        )}
      </button>

      {/* Chat Window */}
      {isOpen && (
        <div className="chatbot-window" id="chatbot-window">
          {/* Header */}
          <div className="chatbot-header">
            <div className="chatbot-header__left">
              <div className="chatbot-header__avatar">🤖</div>
              <div className="chatbot-header__info">
                <h3>Notes Assistant</h3>
                <span>Always online · Smart search</span>
              </div>
            </div>
            <div className="chatbot-header__actions">
              <button className="chatbot-header__btn" onClick={clearChat} title="Clear chat">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="3 6 5 6 21 6" /><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                </svg>
              </button>
              <button className="chatbot-header__btn" onClick={() => setIsOpen(false)} title="Close">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="5" y1="12" x2="19" y2="12" />
                </svg>
              </button>
            </div>
          </div>

          {/* Suggested Prompts */}
          <div className="chatbot-suggestions">
            {suggestions.map(s => (
              <button
                key={s}
                className="chatbot-suggestion-chip"
                onClick={() => handleSend(s)}
              >
                {s}
              </button>
            ))}
          </div>

          {/* Messages */}
          <div className="chatbot-messages">
            {messages.map((msg, i) => (
              <div key={i} className={`chatbot-msg chatbot-msg--${msg.role}`}>
                <div className="chatbot-msg__avatar">
                  {msg.role === 'bot' ? '🤖' : '👤'}
                </div>
                <div>
                  <div className="chatbot-msg__bubble">
                    {renderText(msg.text)}
                  </div>
                  {/* Note cards */}
                  {msg.notes && msg.notes.length > 0 && (
                    <div className="chatbot-notes">
                      {msg.notes.map((note, j) => (
                        <div key={j} className="chatbot-note-card">
                          <div className="chatbot-note-card__header">
                            <span className="chatbot-note-card__subject">
                              {note.subject || note.branch || 'General'}
                            </span>
                            {note.semester && (
                              <span className="chatbot-note-card__semester">{note.semester}</span>
                            )}
                          </div>
                          <div className="chatbot-note-card__title">
                            {note.title || 'Study Notes'}
                          </div>
                          <div className="chatbot-note-card__desc">
                            {note.description || 'No description available.'}
                          </div>
                          {note.tags && note.tags.length > 0 && (
                            <div className="chatbot-note-card__tags">
                              {note.tags.slice(0, 3).map((tag, k) => (
                                <span key={k} className="chatbot-note-card__tag">{tag}</span>
                              ))}
                            </div>
                          )}
                          <button
                            className="chatbot-note-card__preview-btn"
                            onClick={() => {
                              if (note.file_url) window.open(note.file_url, '_blank');
                            }}
                          >
                            Preview →
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}

            {/* Typing indicator */}
            {isTyping && (
              <div className="chatbot-typing">
                <div className="chatbot-msg__avatar" style={{ background: 'linear-gradient(135deg, #6366f1, #3b82f6)', color: '#fff', width: 30, height: 30, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14 }}>🤖</div>
                <div className="chatbot-typing__dots">
                  <div className="chatbot-typing__dot" />
                  <div className="chatbot-typing__dot" />
                  <div className="chatbot-typing__dot" />
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="chatbot-input">
            <input
              ref={inputRef}
              className="chatbot-input__field"
              type="text"
              placeholder="Ask for notes (e.g., DBMS sem 4)"
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              id="chatbot-input"
            />
            <button
              className="chatbot-input__send"
              onClick={() => handleSend()}
              disabled={!input.trim()}
              title="Send"
              id="chatbot-send"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="22" y1="2" x2="11" y2="13" /><polygon points="22 2 15 22 11 13 2 9 22 2" />
              </svg>
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export default Chatbot;
