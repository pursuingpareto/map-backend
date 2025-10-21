defmodule Storymap.PinsFixtures do
  @moduledoc """
  This module defines test helpers for creating
  entities via the `Storymap.Pins` context.
  """

  @doc """
  Generate a pin.
  """
  def pin_fixture(attrs \\ %{}) do
    {:ok, pin} =
      attrs
      |> Enum.into(%{
        latitude: 120.5,
        longitude: 120.5,
        title: "some title"
      })
      |> Storymap.Pins.create_pin(1)

    pin
  end
end
