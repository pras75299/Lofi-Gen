# Lo-Fi Generator (LOFIGEN)

A web application to transform your audio tracks into unique Lo-Fi masterpieces with authentic effects and customizable settings.

## Features

- **Seamless Audio Upload:** Drag & drop or browse to upload your audio files (Supports MP3, WAV, OGG, AAC, MP4 - Max 10MB).
- **Real-Time Lo-Fi Effects:** Apply and preview classic Lo-Fi effects instantly:
  - Vinyl Crackle
  - Tape Hiss
  - Bit Crush
- **Customizable Sound Settings:** Fine-tune your sound with controls for:
  - Reverb
  - Low-Pass Filter
  - Tempo Adjustment
  - Background Music Reduction (Experimental)
- **Advanced Audio Processing:** Explore more sound shaping options:
  - Spatial Audio (Panning L/R, U/D, F/B)
  - Dynamic Compression
  - Pitch Shifting
  - Vocal Reduction (Experimental)
  - Harmonics Addition
- **Waveform Visualization:** See your audio waveform displayed during playback and processing.
- **Authentication:** Secure user accounts via Supabase Auth.
- **Cloud Storage:** Uploaded and processed tracks are stored securely using Supabase Storage.
- **Optimized Export:** Generate and download your Lo-Fi track (currently exports as `.webm` with Opus codec). Features progress indication and caching for faster re-exports.
- **Previous Files:** View and download your previously generated tracks.

## Tech Stack

- **Frontend:** React, TypeScript, Vite, Tailwind CSS
- **Audio Processing:** Tone.js, Web Audio API, `audiobuffer-to-wav`
- **UI Components:** Shadcn/ui (implied by `Slider`, etc.), Lucide Icons, Framer Motion

## Local Setup Instructions

Follow these steps to set up and run the Lo-Fi Generator locally:

1.  **Clone the Repository:**

    ```bash
    git clone <your-repository-url>
    cd lofi-generator # Or your repository directory name
    ```

2.  **Install Dependencies:**
    Make sure you have Node.js and npm (or yarn/pnpm) installed.

    ```bash
    npm install
    ```

3.  **Set Up Supabase:**

    - Create a free account at [supabase.com](https://supabase.com/).
    - Create a new project.
    - In your Supabase project dashboard:
      - Go to **Project Settings** > **API**. Find your **Project URL** and **anon public** API Key.
      - Go to **Storage**. Create a new **Bucket** named `lofi-tracks`. Make sure it's **Public** (or configure Row Level Security appropriately - see step 4).
      - Go to **Authentication** > **Providers** and enable the providers you want (e.g., Email).
      - Go to **Authentication** > **URL Configuration**. Set your **Site URL** to `http://localhost:5173` (or your local dev port) and potentially add `http://localhost:5173/create` to **Redirect URLs**.

4.  **Configure Storage Policies (Row Level Security - RLS):**

    - Go to **Storage** > **Policies**.
    - Ensure policies are set up for the `lofi-tracks` bucket to allow authenticated users to upload to their own prefixed folders (e.g., `user_id/`) and read/delete their own files. Allow public read access for files under the `processed/` prefix if needed.
    - Refer to the SQL migration file (`supabase/migrations/YYYYMMDDHHMMSS_migration_name.sql` - _adjust filename_) in this repository for the specific policies used. You can run this via the Supabase SQL Editor.

5.  **Set Up Environment Variables:**

    - Create a file named `.env` in the root directory of the project.
    - Add your Supabase credentials and local redirect URL:
      ```dotenv
      VITE_SUPABASE_URL=YOUR_SUPABASE_PROJECT_URL
      VITE_SUPABASE_ANON_KEY=YOUR_SUPABASE_ANON_PUBLIC_KEY
      VITE_AUTH_REDIRECT_URL=http://localhost:5173/create
      ```
    - **Important:** Replace `YOUR_SUPABASE_PROJECT_URL` and `YOUR_SUPABASE_ANON_PUBLIC_KEY` with the actual values from your Supabase project settings. Ensure `.env` is listed in your `.gitignore` file to prevent committing secrets.

6.  **Run the Development Server:**
    ```bash
    npm run dev
    ```
    The application should now be running, typically at `http://localhost:5173`.

## Contributing

Please read our [Pull Request Template](.github/pull_request_template.md) for guidelines on contributing to this project.

## License

MIT License
