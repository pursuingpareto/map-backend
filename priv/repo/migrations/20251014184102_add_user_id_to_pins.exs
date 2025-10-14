defmodule Storymap.Repo.Migrations.AddUserIdToPins do
  use Ecto.Migration

  def change do
    alter table(:pins) do
      add :user_id, references(:users, on_delete: :delete_all), null: false
    end

    create index(:pins, [:user_id])
  end
end
