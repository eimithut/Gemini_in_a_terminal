
type FileType = 'file' | 'dir';

interface FileSystemNode {
  type: FileType;
  content?: string; // For files
  isEncoded?: boolean; // If true, content is base64 encoded
  children?: { [name: string]: FileSystemNode }; // For directories
}

const fileSystem: FileSystemNode = {
  type: 'dir',
  children: {
    'home': {
      type: 'dir',
      children: {
        'operator': {
          type: 'dir',
          children: {
            'downloads': {
              type: 'dir',
              children: {
                'freeminecraft.exe': {
                  type: 'file',
                  content: 'Error: This file cannot be run in DOS mode.\nJust kidding, this is a Linux terminal.\nWhy are you downloading exe files anyway?'
                },
                'sys_logs.log': {
                  type: 'file',
                  content: '[INFO] Download started: 100%\n[WARN] Suspicious activity detected\n[INFO] Connection closed.'
                },
                'installer.sh': {
                  type: 'file',
                  content: '#!/bin/bash\necho "Installing..."\nsleep 1\necho "Done."'
                }
              }
            },
            'projects': {
              type: 'dir',
              children: {
                'main.cpp': {
                  type: 'file',
                  content: '#include <iostream>\n\nint main() {\n    std::cout << "Hello World" << std::endl;\n    return 0;\n}'
                },
                'notes.txt': {
                  type: 'file',
                  content: 'To-do:\n1. Fix memory leak in kernel\n2. Buy milk\n3. Take over the world'
                },
                'hack_nasa.py': {
                  type: 'file',
                  content: 'import time\nprint("Hacking NASA...")\ntime.sleep(2)\nprint("Access Denied (Needs more RAM)")'
                },
                '.cache': {
                  type: 'dir',
                  children: {
                    'temp': {
                      type: 'dir',
                      children: {
                        'maze_entry': {
                          type: 'dir',
                          children: {
                            'path_a': {
                              type: 'dir',
                              children: {
                                'winning_folder': {
                                  type: 'dir',
                                  children: {
                                    'reward.txt': { 
                                      type: 'file', 
                                      content: 'You were fooled lol wrong winning folder.\nKeep looking.' 
                                    }
                                  }
                                },
                                'dead_end': {
                                    type: 'file',
                                    content: 'Nothing to see here.'
                                }
                              }
                            },
                            'path_b': {
                              type: 'dir',
                              children: {
                                'deep_layer': {
                                  type: 'dir',
                                  children: {
                                    'no_win_for_sure': {
                                      type: 'dir',
                                      children: {
                                         'jackpot.txt': {
                                            type: 'file',
                                            content: 'Nope. Not here either. You are getting colder.'
                                         }
                                      }
                                    }
                                  }
                                }
                              }
                            }
                          }
                        }
                      }
                    }
                  }
                },
                '.config': {
                    type: 'dir',
                    children: {
                        'app_data': {
                            type: 'dir',
                            children: {
                                'user_prefs.json': { type: 'file', content: '{"theme": "dark", "hacked": false}' },
                                'history.dat': { type: 'file', content: 'BINARY_DATA_CORRUPTED' }
                            }
                        },
                        'local_settings': {
                            type: 'file',
                            content: 'Nothing interesting here. Try sys_core.'
                        },
                        'sys_core': {
                            type: 'dir',
                            children: {
                                'debug': {
                                    type: 'dir',
                                    children: {
                                        'dump_01.log': { type: 'file', content: 'Memory dump at 0x004F3A...' },
                                        'dump_02.log': { type: 'file', content: 'Memory dump at 0x004F3B...' }
                                    }
                                },
                                'network': {
                                    type: 'dir',
                                    children: {
                                        'interfaces': { type: 'file', content: 'eth0: UP\nwlan0: DOWN' },
                                        'hosts': { type: 'file', content: '127.0.0.1 localhost' }
                                    }
                                },
                                'logs': {
                                    type: 'dir',
                                    children: {
                                        'error.log': { type: 'file', content: '[CRITICAL] User is getting closer...' },
                                        'access.log': { type: 'file', content: 'Access granted to user: operator' }
                                    }
                                },
                                'kernel': {
                                    type: 'dir',
                                    children: {
                                        'drivers': {
                                            type: 'dir',
                                            children: {
                                                'gpu_driver.sys': { type: 'file', content: 'BINARY BLOB - DO NOT TOUCH' },
                                                'audio.sys': { type: 'file', content: 'BINARY BLOB' }
                                            }
                                        },
                                        'modules': {
                                            type: 'dir',
                                            children: {
                                                'fs_ext4': { type: 'file', content: 'Loaded' },
                                                'net_ipv4': { type: 'file', content: 'Loaded' }
                                            }
                                        },
                                        'patch': {
                                            type: 'dir',
                                            children: {
                                                'v4.1': {
                                                    type: 'dir',
                                                    children: {
                                                        'changelog.txt': { type: 'file', content: 'Fixed minor bugs.' }
                                                    }
                                                },
                                                'v4.2': {
                                                    type: 'dir',
                                                    children: {
                                                        'secure_node.log': {
                                                            type: 'file',
                                                            isEncoded: true,
                                                            content: 'CgpbU1lTVEVNIFJFU1RPUkUgUE9JTlQgMjAyNS0wNC0xMl0KW0lOVEVHUklUWSBDSEVDSzogUEFTU0VEXQpbUkVDT1ZFUkVEIERBVEEgRlJBR01FTlQgRk9VTkRdCgo9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09CiAgICAgIENPTkdSQVRVTEFUSU9OUyBPUEVSQVRPUiEKPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PQoKWW91IGhhdmUgZGlzY292ZXJlZCB0aGUgaGlkZGVuIHNlY3VyZSBub2RlLgpZb3VyIGN1cmlvc2l0eSBoYXMgYmVlbiByZXdhcmRlZC4KCiQkJSBST0JVWCBSRVdBUkQgJCQkCgpUTyBDTEFJTToKMS4gRE0gJ2VpbWl0aHV0JyBvbiBEaXNjb3JkCjIuIFNlbmQgdGhlIGNvZGU6IFBSMU0zCg=='
                                                        },
                                                        'build_notes.txt': {
                                                            type: 'file',
                                                            content: 'Stable release. Secure node encrypted.'
                                                        }
                                                    }
                                                },
                                                'v4.3-beta': {
                                                    type: 'dir',
                                                    children: {
                                                        'crash_report.log': { type: 'file', content: 'KERNEL PANIC: UNSTABLE' }
                                                    }
                                                }
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    }
                },
                'README.txt': {
                  type: 'file',
                  content: 'Welcome to EndeavourOS Terminal Emulator v2.0.\nUse "ls" to list files.\nUse "cd" to change directories.\nUse "cat" to read files.\n\nType "rbx hunt" to learn about the scavenger hunt.'
                }
              }
            }
          }
        },
        'etc': {
          type: 'dir',
          children: {
            'os-release': {
              type: 'file',
              content: 'NAME="EndeavourOS"\nPRETTY_NAME="EndeavourOS Linux"\nID=endeavouros\nBUILD_ID=rolling'
            },
            'passwd': {
              type: 'file',
              content: 'root:x:0:0:root:/root:/bin/bash\noperator:x:1000:1000::/home/operator:/bin/zsh'
            },
            'hosts': {
              type: 'file',
              content: '127.0.0.1\tlocalhost\n127.0.1.1\tendeavouros'
            }
          }
        },
        'bin': {
          type: 'dir',
          children: {
            'ls': { type: 'file', content: 'Binary file' },
            'cd': { type: 'file', content: 'Binary file' },
            'cat': { type: 'file', content: 'Binary file' },
            'yay': { type: 'file', content: 'Binary file' }
          }
        },
        'var': {
          type: 'dir',
          children: {
            'log': {
              type: 'dir',
              children: {
                 'syslog': { type: 'file', content: 'Jan 1 00:00:01 systemd[1]: Started Session 1 of user root.' }
              }
            }
          }
        }
      }
    }
  }
};

// --- HELPER FUNCTIONS ---

export const resolvePath = (currentPath: string, targetPath: string): string[] => {
  if (targetPath.startsWith('/')) {
    // Absolute path
    return targetPath.split('/').filter(p => p.length > 0);
  }

  // Relative path
  const parts = currentPath.split('/').filter(p => p.length > 0);
  const targetParts = targetPath.split('/').filter(p => p.length > 0);

  for (const part of targetParts) {
    if (part === '.') continue;
    if (part === '..') {
      if (parts.length > 0) parts.pop();
    } else if (part === '~') {
        return ['home', 'operator'];
    } else {
      parts.push(part);
    }
  }
  return parts;
};

const getNode = (pathParts: string[]): FileSystemNode | null => {
  let current = fileSystem;
  for (const part of pathParts) {
    if (current.type === 'dir' && current.children && current.children[part]) {
      current = current.children[part];
    } else {
      return null;
    }
  }
  return current;
};

// --- EXECUTE COMMAND ---

interface CommandResult {
  output: string;
  newPath?: string;
}

export const executeFileSystemCommand = (commandStr: string, currentPath: string): CommandResult | null => {
  const parts = commandStr.trim().split(/\s+/);
  const cmd = parts[0];
  const args = parts.slice(1);
  const pathParts = currentPath.split('/').filter(p => p.length > 0);

  if (cmd === 'ls') {
    let targetParts = pathParts;
    if (args.length > 0) {
      targetParts = resolvePath(currentPath, args[0]);
    }
    
    const node = getNode(targetParts);
    if (!node) return { output: `ls: cannot access '${args[0] || ''}': No such file or directory` };
    if (node.type === 'file') return { output: args[0] };
    
    if (node.children) {
        // If listing a directory, sort output for cleaner look
        const files = Object.keys(node.children).sort().map(name => {
            const isDir = node.children![name].type === 'dir';
            return isDir ? name + '/' : name;
        });
        return { output: files.join('   ') };
    }
    return { output: '' };
  }

  if (cmd === 'cd') {
    if (args.length === 0) return { output: '', newPath: '/home/operator' };
    
    const targetParts = resolvePath(currentPath, args[0]);
    const node = getNode(targetParts);
    
    if (!node) return { output: `cd: no such file or directory: ${args[0]}` };
    if (node.type !== 'dir') return { output: `cd: not a directory: ${args[0]}` };
    
    return { output: '', newPath: '/' + targetParts.join('/') };
  }

  if (cmd === 'cat') {
    if (args.length === 0) return { output: 'cat: missing operand' };
    
    const targetParts = resolvePath(currentPath, args[0]);
    const node = getNode(targetParts);
    
    if (!node) return { output: `cat: ${args[0]}: No such file or directory` };
    if (node.type === 'dir') return { output: `cat: ${args[0]}: Is a directory` };
    
    let content = node.content || '';
    if (node.isEncoded) {
        try {
            content = atob(content);
        } catch (e) {
            content = '[ERROR: ENCRYPTED FILE CORRUPTED]';
        }
    }

    return { output: content };
  }

  if (cmd === 'pwd') {
    return { output: currentPath === '' ? '/' : currentPath };
  }
  
  if (cmd === 'whoami') {
      return { output: 'operator' };
  }

  return null; // Not a filesystem command
};

// --- AUTOCOMPLETE HELPER ---

export const getFileSystemCompletions = (partial: string, currentPath: string): string[] => {
    // Basic implementation: only autocompletes contents of current directory
    const pathParts = currentPath.split('/').filter(p => p.length > 0);
    const node = getNode(pathParts);
    
    if (node && node.type === 'dir' && node.children) {
        const candidates = Object.keys(node.children);
        const matches = candidates.filter(name => name.startsWith(partial));
        
        // Append slash to directories for better UX
        return matches.map(name => {
            const child = node.children![name];
            return child.type === 'dir' ? name + '/' : name;
        });
    }
    return [];
};
