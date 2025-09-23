defmodule Storymap.Repo.Migrations.CreatePins do
  use Ecto.Migration

  def change do
    create table(:pins) do
      add :title, :string
      add :latitude, :float
      add :longitude, :float

      timestamps(type: :utc_datetime)
    end
  end
end
