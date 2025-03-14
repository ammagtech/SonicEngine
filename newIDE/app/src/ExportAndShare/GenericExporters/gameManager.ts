/**
 * Program IDL in camelCase format in order to be used in JS/TS.
 *
 * Note that this is only a type helper and is not the actual IDL. The original
 * IDL can be found at `target/idl/game_manager.json`.
 */
export type GameManager = {
    "address": "BcjPFT8JtRywB6R68PiTZowaaz1b9runSR9U2o16jJyN",
    "metadata": {
      "name": "gameManager",
      "version": "0.1.0",
      "spec": "0.1.0",
      "description": "Created with Anchor"
    },
    "instructions": [
      {
        "name": "deployGame",
        "discriminator": [
          105,
          217,
          28,
          20,
          150,
          155,
          121,
          119
        ],
        "accounts": [
          {
            "name": "game",
            "writable": true,
            "pda": {
              "seeds": [
                {
                  "kind": "const",
                  "value": [
                    103,
                    97,
                    109,
                    101
                  ]
                },
                {
                  "kind": "arg",
                  "path": "title"
                },
                {
                  "kind": "account",
                  "path": "user"
                }
              ]
            }
          },
          {
            "name": "user",
            "writable": true,
            "signer": true
          },
          {
            "name": "systemProgram",
            "address": "11111111111111111111111111111111"
          }
        ],
        "args": [
          {
            "name": "title",
            "type": "string"
          },
          {
            "name": "description",
            "type": "string"
          }
        ]
      }
    ],
    "accounts": [
      {
        "name": "game",
        "discriminator": [
          27,
          90,
          166,
          125,
          74,
          100,
          121,
          18
        ]
      }
    ],
    "types": [
      {
        "name": "game",
        "type": {
          "kind": "struct",
          "fields": [
            {
              "name": "title",
              "type": "string"
            },
            {
              "name": "description",
              "type": "string"
            },
            {
              "name": "authority",
              "type": "pubkey"
            }
          ]
        }
      }
    ]
  };
  