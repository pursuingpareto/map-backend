defmodule Storymap.Pins.Pin do
  use Ecto.Schema
  import Ecto.Changeset

  schema "pins" do
    field :title, :string
    field :latitude, :float
    field :longitude, :float

    timestamps(type: :utc_datetime)
  end

  @doc false
  def changeset(pin, attrs) do
    pin
    |> cast(attrs, [:title, :latitude, :longitude])
    |> validate_required([:title, :latitude, :longitude])
  end
end
