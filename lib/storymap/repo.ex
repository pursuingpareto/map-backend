defmodule Storymap.Repo do
  use Ecto.Repo,
    otp_app: :storymap,
    adapter: Ecto.Adapters.Postgres
end
