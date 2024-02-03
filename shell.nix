let
  pkgs = import <nixpkgs> {};
in
  pkgs.mkShellNoCC {
    name = "rvx-builder";
    packages = [
      pkgs.android-tools
      pkgs.nodejs
      pkgs.jdk17_headless
    ];
    shellHook = ''
      npm install
    '';
  }
