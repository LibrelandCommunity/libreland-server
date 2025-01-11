#!/bin/bash
export STEAM_COMPAT_CLIENT_INSTALL_PATH=~/.local/share/Steam
export STEAM_COMPAT_DATA_PATH=~/.local/share/Steam/steamapps/compatdata/505700
export PRESSURE_VESSEL_FILESYSTEMS_RW=$XDG_RUNTIME_DIR/wivrn_comp_ipc
export WINEDLLOVERRIDES="winhttp=n,b"
export DOORSTOP_ENABLE=TRUE
export DOORSTOP_INVOKE_DLL_PATH="BepInEx/core/BepInEx.Preloader.dll"

~/.steam/root/compatibilitytools.d/GE-Proton9-20-rtsp16/proton run ~/Downloads/Anyland-Steam-Install_14-November-2022/anyland.exe