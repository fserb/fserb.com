---
layout: page
title: task
date: 2023-05-24 22:44
---

There are a few common things I end up doing in all my projects, independently of 
the programming language I use. One of them is a text file with notes, TODOs, and
design ideas. The other is a `task` file. This is about the latter.

A `task` file is shell script with a collection of commands that I use to build, test, sync and do whatever else is needed for the project. Think of it as a mix of
an annotated bash history of the project and a Makefile.

# Skeleton

Every `task` file is usually in the root of the project, and this is the basic skeleton of one:

```sh
#!/bin/bash
set -euo pipefail
IFS=$'\n\t'

# add functions here...

function help {
  echo "$0 <task> <args>"
  echo "Tasks:"
  compgen -A function | grep -v "^_" | cat -n
}

"${@:-help}"
```

Let's go through the relevant lines.

```sh
set -euo pipefail
```
sets 3 options for the shell:
- `-e` makes the shell exit if any command fails
- `-u` makes the shell exit if any variable is undefined
- `-o pipefail` makes the shell exit if any command in a pipe fails

```sh
IFS=$'\n\t'
```
sets the internal field separator to newline and tab. This is usually what I want when doing any for loops over files, etc...

The help function lists all functions available on the file as commands, except if they start if "`_`", which I use for rare internal functions.

The final line tries to call whatever function is passed as the first parameter, and defaults to `help`.

I used to also time the task, by replacing the last line with:

```sh
TIMEFORMAT="Task completed in %3lR"
time "${@:-help}"
```

But I since moved a version of this to my prompt.


# How to use

The way I use `task` is to simply populate with high level functions I care about in a project. It's a great way to document things for my future self.

For example, on this site, I have commands like:

```sh
function watch {
  lume --watch "$@"
}

function build {
  lume "$@"
}
```

Most of the times they are one or two liners, but sometimes they grow into 10-20 lines scripts.

And then call it directly from the root of the project:

```sh
$ ./task build
```


# Auto-complete

Another advantage of always using `task` as the build, is that I can have zsh autocomplete based on the `help` function above.

This is the relevant part of my `.zsh` config:

```sh
function _task {
  ARGS=( $($_comp_command1 help 2>/dev/null | \
    awk 'FNR > 2 {print $2}' | paste -s -d' '  -) )
  _arguments '1: :(${ARGS[@]})'
}

compdef _task task
```

It translate the one command per line output of `help` into an array of strings (`ARGS`), and sends it to the internal zsh autocomplete.


# Final thoughts

`task` has completely changed how I self-document my projects. Doing a quick search on my computer, there are 43 task files. It makes it easier for me to go back to projects that I haven't touched in a while.

More importantly, it's extremely lightweight, it has no external dependencies, and it's fairly accessible to anyone that knows a bit of bash.
