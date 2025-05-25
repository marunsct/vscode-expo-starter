# Use Ubuntu as base
FROM ubuntu:22.04

# Set non-interactive mode for apt
ENV DEBIAN_FRONTEND=noninteractive

# Install dependencies
RUN apt-get update && apt-get install -y \
    curl \
    wget \
    git \
    unzip \
    openjdk-17-jdk \
    build-essential \
    libgl1-mesa-dev \
    libpulse0 \
    libasound2 \
    libx11-dev \
    libxkbfile-dev \
    libsecret-1-dev \
    software-properties-common \
    python3 \
    python3-pip \
    python3-venv \
    x11-apps \
    xvfb \
    && rm -rf /var/lib/apt/lists/*

# Install Node.js (LTS)
RUN curl -fsSL https://deb.nodesource.com/setup_lts.x | bash - && \
    apt-get install -y nodejs

# Install yarn
RUN npm install -g yarn

# Install Expo CLI and React Native CLI
RUN npm install -g expo-cli react-native-cli

# Install VS Code (code-server)
RUN curl -fsSL https://code-server.dev/install.sh | sh

# Install Android SDK Command Line Tools
ENV ANDROID_SDK_ROOT=/opt/android-sdk
RUN mkdir -p $ANDROID_SDK_ROOT/cmdline-tools && \
    cd $ANDROID_SDK_ROOT/cmdline-tools && \
    wget https://dl.google.com/android/repository/commandlinetools-linux-11076708_latest.zip -O cmdline-tools.zip && \
    unzip cmdline-tools.zip && \
    mv cmdline-tools latest && \
    rm cmdline-tools.zip

# Set environment variables for Android SDK
ENV PATH=$PATH:$ANDROID_SDK_ROOT/latest/bin:$ANDROID_SDK_ROOT/platform-tools:$ANDROID_SDK_ROOT/emulator

# Accept Android SDK licenses and install emulator, platform tools, system images
RUN yes | $ANDROID_SDK_ROOT/cmdline-tools/latest/bin/sdkmanager --licenses
RUN $ANDROID_SDK_ROOT/cmdline-tools/latest/bin/sdkmanager "platform-tools" "platforms;android-33" "emulator" "system-images;android-33;google_apis;x86_64"
RUN echo "no" | $ANDROID_SDK_ROOT/cmdline-tools/latest/bin/avdmanager create avd -n test -k "system-images;android-33;google_apis;x86_64" --device "pixel"

# Create and configure Android emulator
RUN echo "no" | $ANDROID_SDK_ROOT/emulator/emulator -list-avds || true
# RUN echo "no" | $ANDROID_SDK_ROOT/latest/bin/avdmanager create avd -n test -k "system-images;android-33;google_apis;x86_64" --device "pixel"

# Expose ports for Expo and VS Code
EXPOSE 8081 19000 19001 19002 8888

# Add a user for development
RUN useradd -ms /bin/bash devuser

# Copy application files into the container
COPY . /home/devuser/app
RUN chown -R devuser:devuser /home/devuser/app

WORKDIR /home/devuser/app
USER devuser

# Set HOME and ANDROID_AVD_HOME for devuser
ENV HOME=/home/devuser
ENV ANDROID_AVD_HOME=/home/devuser/.android/avd

# Create AVD as devuser
RUN mkdir -p $ANDROID_AVD_HOME && \
    $ANDROID_SDK_ROOT/cmdline-tools/latest/bin/avdmanager create avd -n test -k "system-images;android-33;google_apis;x86_64" --device "pixel" --force


# Start code-server and instructions for Expo/Android
CMD code-server --bind-addr 0.0.0.0:8888 --auth none

# Helpful notes:
# - To run the Android emulator, you may need to start it with:
#   $ANDROID_SDK_ROOT/emulator/emulator -avd test -no-window -no-audio &
# - For GUI access to the emulator, you need to set up X11 forwarding or use a VNC server.
# - To start Expo, run: expo start