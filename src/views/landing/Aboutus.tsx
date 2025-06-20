import React, { useState, useEffect, useRef } from 'react';
import { useTheme } from '@/theme';
// Define types for our data structures

interface HistoryEntry {
  command: string;
  output: React.ReactNode;
  outputClass: string;
}

const TerminalInterface = () => {
  const [command, setCommand] = useState('');
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);
  const terminalRef = useRef<HTMLDivElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const theme = useTheme();
  // Auto-scroll to bottom when history changes
  useEffect(() => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollTop = scrollContainerRef.current.scrollHeight;
    }
  }, [history]);

  const handleCommand = (cmd: string) => {
    const trimmedCmd = cmd.trim();
    if (!trimmedCmd) return;

    let output: React.ReactNode = null;
    let outputClass = '';

    switch (trimmedCmd.toLowerCase()) {
      case 'help':
        output = (
          <div className="space-y-2">
            <div className="text-cyan-600 dark:text-cyan-400 font-bold mb-3">
              Available Commands:
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {[
                { cmd: 'help', desc: 'Show this help message' },
                { cmd: 'clear', desc: 'Clear the terminal' },
                { cmd: 'date', desc: 'Show current date' },
                { cmd: 'echo [text]', desc: 'Echo text' },
                { cmd: 'whoami', desc: 'Show current user' },
                { cmd: 'ls', desc: 'List files' },
                { cmd: 'uptime', desc: 'Show system uptime' },
                { cmd: 'cat [file]', desc: 'Display file contents' },
              ].map(({ cmd, desc }) => (
                <div
                  key={cmd}
                  className="flex items-center space-x-3 p-2 bg-gray-100 dark:bg-gray-800 rounded"
                >
                  <span className="text-yellow-600 dark:text-yellow-400 font-mono font-bold min-w-0 flex-shrink-0">
                    {cmd}
                  </span>
                  <span className="text-gray-600 dark:text-gray-400 text-sm">{desc}</span>
                </div>
              ))}
            </div>
          </div>
        );
        break;
      case 'clear':
        setHistory([]);
        break;
      case 'date': {
        const now = new Date();
        output = (
          <div className="space-y-2">
            <div className="flex items-center space-x-4">
              <div className="text-blue-600 dark:text-blue-400 font-bold">Current Date & Time:</div>
            </div>
            <div className="bg-gray-100 dark:bg-gray-800 p-3 rounded-lg">
              <div className="text-lg font-mono">{now.toDateString()}</div>
              <div className="text-2xl font-mono text-black dark:text-white">
                {now.toLocaleTimeString()}
              </div>
              <div className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                Timezone: {Intl.DateTimeFormat().resolvedOptions().timeZone}
              </div>
            </div>
          </div>
        );
        break;
      }
      case 'whoami':
        output = (
          <div className="flex items-center space-x-3 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-700">
            <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white font-bold">
              U
            </div>
            <div>
              <div className="font-bold text-blue-600 dark:text-blue-400">user</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">System Administrator</div>
            </div>
          </div>
        );
        break;
      case 'ls': {
        const files = [
          { name: 'Documents/', type: 'directory', size: '4.0K', color: 'text-blue-500' },
          { name: 'Downloads/', type: 'directory', size: '4.0K', color: 'text-blue-500' },
          { name: 'script.sh', type: 'executable', size: '8.1K', color: 'text-green-500' },
          {
            name: 'config.txt',
            type: 'file',
            size: '1.0K',
            color: 'text-gray-600 dark:text-gray-400',
          },
          { name: 'archive.tar.gz', type: 'archive', size: '2.0K', color: 'text-orange-500' },
          { name: 'image.png', type: 'image', size: '512B', color: 'text-pink-500' },
        ];
        output = (
          <div className="space-y-2">
            <div className="text-cyan-600 dark:text-cyan-400 font-bold mb-2">
              Directory Contents:
            </div>
            <div className="grid gap-1">
              {files.map(file => (
                <div
                  key={file.name}
                  className="flex items-center justify-between p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded"
                >
                  <div className="flex items-center space-x-3">
                    <span className={`font-mono ${file.color}`}>{file.name}</span>
                    <span className="text-xs px-2 py-1 bg-gray-200 dark:bg-gray-700 rounded">
                      {file.type}
                    </span>
                  </div>
                  <span className="text-sm text-gray-500 dark:text-gray-400">{file.size}</span>
                </div>
              ))}
            </div>
          </div>
        );
        break;
      }
      case 'uptime':
        output = (
          <div className="space-y-3">
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-green-600 dark:text-green-400 font-bold">
                System Status: Online
              </span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-gray-100 dark:bg-gray-800 p-3 rounded-lg text-center">
                <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">2d 7h</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Uptime</div>
              </div>
              <div className="bg-gray-100 dark:bg-gray-800 p-3 rounded-lg text-center">
                <div className="text-2xl font-bold text-green-600 dark:text-green-400">1</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Active Users</div>
              </div>
              <div className="bg-gray-100 dark:bg-gray-800 p-3 rounded-lg text-center">
                <div className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">0.15</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Load Average</div>
              </div>
            </div>
          </div>
        );
        break;
      case 'cat sudeep.lead':
        output = (
          <div className="flex items-center space-x-4 p-4 bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-900/20 dark:to-blue-900/20 rounded-lg border border-purple-200 dark:border-purple-700">
            <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full flex items-center justify-center text-white font-bold text-lg">
              S
            </div>
            <div>
              <div className="text-lg font-bold text-purple-600 dark:text-purple-400">
                Sudeep - Team Lead
              </div>
              <div className="text-gray-700 dark:text-gray-300">4th year CSE IIT Bhilai</div>
              <div className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                Leading the development team
              </div>
            </div>
          </div>
        );
        outputClass = 'success';
        break;
      case 'cat naman.frontend':
        output = (
          <div className="flex items-center space-x-4 p-4 bg-gradient-to-r from-green-50 to-teal-50 dark:from-green-900/20 dark:to-teal-900/20 rounded-lg border border-green-200 dark:border-green-700">
            <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-teal-500 rounded-full flex items-center justify-center text-white font-bold text-lg">
              N
            </div>
            <div>
              <div className="text-lg font-bold text-green-600 dark:text-green-400">
                Naman - Frontend Developer
              </div>
              <div className="text-gray-700 dark:text-gray-300">2nd year CSE IIT Bhilai</div>
              <div className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                Building beautiful user interfaces
              </div>
            </div>
          </div>
        );
        outputClass = 'success';
        break;
      case 'cat slok.fullstack':
        output = (
          <div className="flex items-center space-x-4 p-4 bg-gradient-to-r from-orange-50 to-red-50 dark:from-orange-900/20 dark:to-red-900/20 rounded-lg border border-orange-200 dark:border-orange-700">
            <div className="w-12 h-12 bg-gradient-to-r from-orange-500 to-red-500 rounded-full flex items-center justify-center text-white font-bold text-lg">
              S
            </div>
            <div>
              <div className="text-lg font-bold text-orange-600 dark:text-orange-400">
                Slok - Full Stack Developer
              </div>
              <div className="text-gray-700 dark:text-gray-300">2nd year CSE IIT Bhilai</div>
              <div className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                Full stack development expertise
              </div>
            </div>
          </div>
        );
        outputClass = 'success';
        break;
      case 'cat rohit.frontend':
        output = (
          <div className="flex items-center space-x-4 p-4 bg-gradient-to-r from-cyan-50 to-blue-50 dark:from-cyan-900/20 dark:to-blue-900/20 rounded-lg border border-cyan-200 dark:border-cyan-700">
            <div className="w-12 h-12 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-full flex items-center justify-center text-white font-bold text-lg">
              R
            </div>
            <div>
              <div className="text-lg font-bold text-cyan-600 dark:text-cyan-400">
                Rohit - Frontend Developer
              </div>
              <div className="text-gray-700 dark:text-gray-300">2nd year Electrical IIT Bhilai</div>
              <div className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                Creating responsive web experiences
              </div>
            </div>
          </div>
        );
        outputClass = 'success';
        break;
      case 'neofetch':
        output = (
          <div style={{ display: 'flex' }}>
            <pre className="whitespace-pre text-sm font-mono leading-tight text-black dark:text-white">
              {`
MMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMM
MMMMMNOdlccclx0NMMMMMMMMMMMMMMMMMMMMMMMM
MMMXd'        .,xNMMMMMMMMMMMMMMMMMMMMMM
MM0;             :KMMMMMMMMMMMMMMMMMMMMM
MX:               lNMMMMMMMMMMMWKdllkNMM
M0'               ,KMMMMMMMMMMM0,   .dWM
MK;               '0MMMMMMMMMMMk.   .kWM
MWk.               :kKMMMMMMMMK:.'lxKWMM
MMW0:.               'lkKXXKOo'.cXWMMMMM
MMMMW0d:,'.',clol:'     ....   '0MMMMMMM
MMMMMMMMWNNNWMMMMWXxl'         .kMMMMMMM
MMMMMMMMMMMMMMMMMMMMW0'         oWMMMMMM
MMMMMMMMMMMMMMMMMMMMMWx.       'OMMMMMMM
MMMMMMMMMMMMMMMMMMMMMMWk:.. .'c0WMMMMMMM
MMMMMMMMMMMMMMMMMMMMMMMMWX00KNWMMMMMMMMM
MMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMM
                `}
            </pre>
            <div className="max-w-2xl mx-auto  p-6 rounded-xl font-mono text-sm transition-colors duration-300">
              <p>
                <span className="text-green-600 dark:text-green-400">seamless</span>@
                <span className="text-blue-600 dark:text-blue-400">iitbhilai</span>
              </p>
              <hr className="my-2 border-gray-300 dark:border-gray-600" />

              <div className="space-y-1 text-gray-800 dark:text-gray-200">
                <p>
                  <span className="font-semibold text-green-700 dark:text-green-400">Origin:</span>{' '}
                  IIT Bhilai
                </p>
                <p>
                  <span className="font-semibold text-green-700 dark:text-green-400">
                    Incubation:
                  </span>{' '}
                  IBITF
                </p>
                <p>
                  <span className="font-semibold text-green-700 dark:text-green-400">Kernel:</span>{' '}
                  6.15.2-arch1-1
                </p>
                <p>
                  <span className="font-semibold text-green-700 dark:text-green-400">Uptime:</span>{' '}
                  3 hours, 33 mins
                </p>
                <p>
                  <span className="font-semibold text-green-700 dark:text-green-400">
                    Packages:
                  </span>{' '}
                  1094 (pacman), 39 (flatpak)
                </p>
                <p>
                  <span className="font-semibold text-green-700 dark:text-green-400">Shell:</span>{' '}
                  nu 0.105.1
                </p>
                <p>
                  <span className="font-semibold text-green-700 dark:text-green-400">
                    Resolution:
                  </span>{' '}
                  2560x1440
                </p>
                <p>
                  <span className="font-semibold text-green-700 dark:text-green-400">DE:</span>{' '}
                  Hyprland
                </p>
                <p>
                  <span className="font-semibold text-green-700 dark:text-green-400">Theme:</span>{' '}
                  {theme.theme}
                </p>
              </div>

              <div className="mt-4 flex gap-1">
                <div className="w-5 h-3 rounded-sm bg-red-400 dark:bg-red-500"></div>
                <div className="w-5 h-3 rounded-sm bg-green-400 dark:bg-green-500"></div>
                <div className="w-5 h-3 rounded-sm bg-yellow-400 dark:bg-yellow-500"></div>
                <div className="w-5 h-3 rounded-sm bg-blue-400 dark:bg-blue-500"></div>
                <div className="w-5 h-3 rounded-sm bg-pink-400 dark:bg-pink-500"></div>
                <div className="w-5 h-3 rounded-sm bg-cyan-400 dark:bg-cyan-500"></div>
                <div className="w-5 h-3 rounded-sm bg-gray-400 dark:bg-gray-500"></div>
              </div>
            </div>
          </div>
        );
        outputClass = 'success';
        break;
      case 'team':
        output = (
          <>
            <div className="flex flex-wrap justify-center gap-6 p-6">
              {[
                { name: 'Sudeep ranjan sahoo', role: 'Team Lead', img: '/team/srs.jpg' },
                { name: 'Naman Sharma', role: 'Frontend developer', img: '/team/naman.jpg' },
                { name: 'Rohit', role: 'Frontend developer', img: '/team/rohit.jpg' },
                { name: 'Slok', role: 'Full stack developer', img: '/team/slok.jpg' },
                { name: 'Ujjwal raj', role: 'Backend developer', img: '/team/uj.jpg' },
              ].map((member, i) => (
                <div
                  key={i}
                  className="w-64 sm:w-60 bg-white dark:bg-zinc-900 rounded-2xl shadow-md p-4 text-center transition hover:scale-[1.02]"
                >
                  <img
                    src={member.img}
                    alt={member.name}
                    className="w-20 h-20 mx-auto rounded-full object-cover mb-3"
                  />
                  <h3 className="text-lg font-semibold text-gray-800 dark:text-white">
                    {member.name}
                  </h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">{member.role}</p>
                </div>
              ))}
            </div>
          </>
        );
        outputClass = 'success';
        break;
      case 'faculty':
        output = (
          <>
            <div className="flex flex-wrap justify-center gap-6 p-6">
              {[
                { name: 'Prof. Santosh Biswas', role: '', img: '/team/santosh.jpg' },
                { name: 'Dr. Amit Kumar Dhar', role: '', img: '/team/amit.jpg' },
                { name: 'Dr. Gagan Raj Gupta', role: '', img: '/team/gagan.jpg' },
                { name: 'Dr. Anand Baswade', role: '', img: '/team/anand.jpg' },
              ].map((member, i) => (
                <div
                  key={i}
                  className="w-64 sm:w-60 bg-white dark:bg-zinc-900 rounded-2xl shadow-md p-4 text-center transition hover:scale-[1.02]"
                >
                  <img
                    src={member.img}
                    alt={member.name}
                    className="w-20 h-20 mx-auto rounded-full object-cover mb-3"
                  />
                  <h3 className="text-lg font-semibold text-gray-800 dark:text-white">
                    {member.name}
                  </h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">{member.role}</p>
                </div>
              ))}
            </div>
          </>
        );
        outputClass = 'success';
        break;

      default:
        if (trimmedCmd.startsWith('echo ')) {
          const text = trimmedCmd.substring(5);
          output = (
            <div className="flex items-center space-x-3 p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg border border-yellow-200 dark:border-yellow-700">
              <div className="text-yellow-600 dark:text-yellow-400">💬</div>
              <div className="text-gray-800 dark:text-gray-200 font-medium">{text}</div>
            </div>
          );
        } else {
          output = (
            <div className="flex items-center space-x-3 p-3 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-700">
              <div className="text-red-500">❌</div>
              <div>
                <div className="text-red-600 dark:text-red-400 font-bold">
                  Command not found: {trimmedCmd}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                  Type{' '}
                  <span className="font-mono bg-gray-200 dark:bg-gray-700 px-1 rounded">help</span>{' '}
                  to see available commands
                </div>
              </div>
            </div>
          );
          outputClass = 'error';
        }
    }

    setHistory(prev => [...prev, { command: trimmedCmd, output, outputClass }]);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleCommand(command);
      setCommand('');
    }
  };

  const handleClick = () => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
  };
  function getGhostSuggestion(input: string, commands: string[]): string | null {
    if (!input) return null;
    const match = commands.find(cmd => cmd.startsWith(input));
    return match && match !== input ? match : null;
  }
  const commands = [
    'help',
    'clear',
    'date',
    'whoami',
    'ls',
    'uptime',
    'cat sudeep.lead',
    'cat naman.frontend',
    'cat slok.fullstack',
    'cat rohit.frontend',
    'neofetch',
  ];
  const suggestion = getGhostSuggestion(command, commands);
  const ghost = suggestion ? suggestion.slice(command.length) : '';
  return (
    <div>
      <div className="h-screen flex bg-slate-50  dark:bg-gray-900 text-green-600 dark:text-green-400 text-sm leading-relaxed overflow-hidden relative font-mono pb-480 pt-24">
        <div className="pt-16 flex justify-center">
          <div className="relative group">
            <h2 className="text-8xl md:text-8xl lg:text-8xl font-extralight text-center tracking-widest">
              <span className="inline-block px-12 py-4 text-gray-900 dark:text-gray-100 relative overflow-hidden transition-all duration-500 ease-out hover:text-gray-700 dark:hover:text-gray-300">
                ABOUT US
                <span className="absolute bottom-0 left-0 w-0 h-px bg-gradient-to-r from-gray-400 via-gray-600 to-gray-400 group-hover:w-full transition-all duration-700 ease-out"></span>
              </span>
            </h2>
          </div>
        </div>
        {/* Terminal Container - Fixed height and centered */}

        <div className="h-screen  flex items-center justify-center  relative z-10 w-full pr-10">
          <div className="w-full max-w-6xl h-5/6 flex flex-col">
            {/* Terminal Header */}
            <div className="bg-gray-200 dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-t-lg p-3 flex items-center gap-2 shadow-lg flex-shrink-0">
              <div className="flex gap-1.5">
                <div className="w-3 h-3 rounded-full bg-red-500"></div>
                <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                <div className="w-3 h-3 rounded-full bg-green-500"></div>
              </div>
              <div className="ml-auto text-gray-600 dark:text-gray-400 text-xs font-medium">
                seamless@iitbhilai: ~
              </div>
            </div>

            {/* Terminal Window - Scrollable content area */}
            <div
              className="bg-white dark:bg-black border border-gray-300 dark:border-gray-600 border-t-0 rounded-b-lg flex-1 flex flex-col overflow-hidden cursor-text shadow-xl"
              onClick={handleClick}
              ref={terminalRef}
              style={{
                background:
                  'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(34, 197, 94, 0.03) 2px, rgba(34, 197, 94, 0.03) 4px)',
              }}
            >
              {/* Scrollable Content Container */}
              <div
                ref={scrollContainerRef}
                className="flex-1 overflow-y-auto p-6 scrollbar-thin scrollbar-thumb-gray-400 dark:scrollbar-thumb-gray-600 scrollbar-track-transparent"
              >
                {/* Welcome Message */}
                <div className="mb-6 space-y-2">
                  <div className="text-cyan-600 dark:text-cyan-400 font-bold text-lg">
                    Welcome to Terminal Interface
                  </div>
                  <div className="text-gray-700 dark:text-gray-300">
                    Type{' '}
                    <span className="text-yellow-600 dark:text-yellow-400 font-semibold bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded">
                      help
                    </span>{' '}
                    to see all available commands
                  </div>
                  <div className="h-px bg-gradient-to-r from-transparent via-gray-300 dark:via-gray-600 to-transparent my-4"></div>
                </div>

                {/* Command History */}
                {history.map((entry, index) => (
                  <div key={index} className="mb-4">
                    <div className="flex items-center mb-2 bg-gray-50 dark:bg-gray-800 rounded-lg p-2">
                      <span className="text-green-600 dark:text-green-400 font-bold mr-3">
                        <span className="text-cyan-600 dark:text-cyan-400">seamless</span>
                        <span className="text-gray-500">@</span>
                        <span className="text-yellow-600 dark:text-yellow-400">iitbhilai</span>
                        <span className="text-gray-500">:</span>
                        <span className="text-purple-600 dark:text-purple-400">~</span>
                        <span className="text-gray-500">$</span>
                      </span>
                      <span className="text-gray-800 dark:text-white font-medium">
                        {entry.command}
                      </span>
                    </div>
                    {entry.output && (
                      <div
                        className={`ml-6 ${
                          entry.outputClass === 'error'
                            ? ''
                            : entry.outputClass === 'success'
                              ? ''
                              : entry.outputClass === 'warning'
                                ? ''
                                : ''
                        }`}
                      >
                        {entry.output}
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {/* Fixed Input Area at Bottom */}
              <div className="flex-shrink-0 p-6 pt-0">
                {/* Input Line */}
                <div className="flex items-center font-mono text-base rounded-md px-4 py-2 transition-colors shadow-sm">
                  {/* Prompt */}
                  <span className="text-green-600 dark:text-green-400 font-bold mr-3 whitespace-nowrap">
                    <span className="text-cyan-600 dark:text-cyan-400">seamless</span>
                    <span className="text-gray-500">@</span>
                    <span className="text-yellow-600 dark:text-yellow-400">iitbhilai</span>
                    <span className="text-gray-500">:</span>
                    <span className="text-purple-600 dark:text-purple-400">~</span>
                    <span className="text-gray-500">$</span>
                  </span>

                  {/* Input with ghost suggestion */}
                  <div className="relative w-full">
                    {/* Ghost suggestion layer */}
                    <div className="absolute inset-0 px-0 py-0 pointer-events-none select-none whitespace-pre">
                      <span className="text-transparent">{command}</span>
                      <span className="text-gray-400 dark:text-zinc-600">{ghost}</span>
                    </div>

                    {/* Actual input */}
                    <input
                      ref={inputRef}
                      type="text"
                      value={command}
                      onChange={e => setCommand(e.target.value)}
                      onKeyDown={handleKeyDown}
                      className="w-full bg-transparent border-none outline-none text-zinc-900 dark:text-white placeholder-zinc-400 dark:placeholder-zinc-600"
                      placeholder="Type a command..."
                      autoComplete="off"
                      spellCheck="false"
                    />
                  </div>
                </div>

                {/* Quick Commands */}
                <div className="mt-4 flex flex-wrap gap-2">
                  {['help', 'ls', 'whoami', 'date', 'clear', 'neofetch', 'team', 'faculty'].map(
                    cmd => (
                      <button
                        key={cmd}
                        onClick={() => {
                          setCommand(cmd);
                          inputRef.current?.focus();
                        }}
                        className="px-3 py-1 text-xs bg-zinc-200 dark:bg-zinc-700 text-zinc-700 dark:text-zinc-300 rounded-full hover:bg-zinc-300 dark:hover:bg-zinc-600 transition-colors border border-zinc-300 dark:border-zinc-600"
                      >
                        {cmd}
                      </button>
                    )
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        <style>{`
        @keyframes fall {
          0% { transform: translateY(-100vh); }
          100% { transform: translateY(100vh); }
        }
        
        .scrollbar-thin {
          scrollbar-width: thin;
        }
        
        .scrollbar-thumb-gray-400::-webkit-scrollbar {
          width: 6px;
        }
        
        .scrollbar-thumb-gray-400::-webkit-scrollbar-track {
          background: transparent;
        }
        
        .scrollbar-thumb-gray-400::-webkit-scrollbar-thumb {
          background-color: rgb(156 163 175);
          border-radius: 3px;
        }
        
        .dark .scrollbar-thumb-gray-600::-webkit-scrollbar-thumb {
          background-color: rgb(75 85 99);
        }
        
        .scrollbar-thumb-gray-400::-webkit-scrollbar-thumb:hover {
          background-color: rgb(107 114 128);
        }
      `}</style>
      </div>
    </div>
  );
};

export default TerminalInterface;
