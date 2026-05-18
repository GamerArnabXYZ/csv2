cmake_minimum_required(VERSION 3.10)
project(CraftSprint)
set(CMAKE_CXX_STANDARD 11)
include_directories(${CMAKE_CURRENT_SOURCE_DIR})
file(GLOB_RECURSE ENGINE_SOURCES "engine/*.cpp")

if(EMSCRIPTEN)
    add_executable(craftsprint ${ENGINE_SOURCES}
        "platform/android/app/src/main/cpp/jni_bridge.cpp")
    set_target_properties(craftsprint PROPERTIES OUTPUT_NAME "craftsprint" SUFFIX ".js")
    target_compile_options(craftsprint PRIVATE "-fno-exceptions" "-fno-rtti" "-O2")
    target_link_options(craftsprint PRIVATE
        "-sUSE_WEBGL2=0" "-sFULL_ES2=1" "-sWASM=1" "-sLEGACY_VM_SUPPORT=1"
        "-sALLOW_MEMORY_GROWTH=1"
        "-sEXPORTED_FUNCTIONS=['_start_game','_handle_swipe','_stop_game','_restart_game']"
        "-sEXPORTED_RUNTIME_METHODS=['ccall','cwrap']"
        "-sNO_EXIT_RUNTIME=1" "-sDISABLE_EXCEPTION_CATCHING=1"
        "-sFILESYSTEM=0" "--no-entry" "-fno-exceptions" "-O3")
else()
    add_library(craftsprint SHARED ${ENGINE_SOURCES}
        "platform/android/app/src/main/cpp/jni_bridge.cpp")
    target_link_libraries(craftsprint GLESv2 log android)
endif()
