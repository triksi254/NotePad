// SPDX-License-Identifier: MIT

pragma solidity ^0.8.18;

import "@openzeppelin/contracts/token/ERC1155/ERC1155.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract NoteToken is ERC1155, Ownable {
    struct Note {
        string text;
        uint256 price;
        bool purchased;
    }

    Note[] public notes;

    constructor(string memory _baseURI) ERC1155(_baseURI) {}

    function addNote(string memory _text, uint256 _price) public onlyOwner returns (uint256) {
        uint256 newNoteId = notes.length;
        notes.push(Note({ text: _text, price: _price, purchased: false }));
        _mint(msg.sender, newNoteId, 1, "");
        return newNoteId;
    }

    function purchaseNote(uint256 _noteId) public payable {
        require(_noteId < notes.length, "Note ID does not exist");
        Note storage note = notes[_noteId];
        require(!note.purchased, "Note already purchased");
        require(msg.value == note.price, "Incorrect payment amount");
        note.purchased = true;
        _safeTransferFrom(address(this), msg.sender, _noteId, 1, "");
    }

    function getNoteByIndex(uint256 _index) public view returns (Note memory) {
        require(_index < notes.length, "Note ID does not exist");
        return notes[_index];
    }

    function supportsInterface(bytes4 interfaceId) public view virtual override returns (bool) {
        return interfaceId == type(IERC1155MetadataURI).interfaceId || super.supportsInterface(interfaceId);
    }
}