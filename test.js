'use strict';

var textual = require('./index');
var assert = require('chai').assert;

var file = '2014-07-04.txt';

describe('parse()', function(){
  it('should throw if missing directory argument', function(){
    assert.throws(textual.parse, 'textual-log-parser requires a directory to read logs from.');
  });
});

describe('formatLine()', function(){
  describe('discard unwanted lines', function(){
    it('should handle empty lines', function(){
      var line = textual.formatLine('', file);
      assert.isUndefined(line, 'discarded empty');
    });

    it('should handle empty semi-lines', function(){
      var line = textual.formatLine(' ', file);
      assert.isUndefined(line, 'discarded semi-empty');
    });

    describe('should discard session lines', function(){
      it('beginning of the line - begin', function(){
        var line = textual.formatLine('————————————— Begin Session —————————————', file);
        assert.isUndefined(line);
      });
      it('beginning of the line - end', function(){
        var line = textual.formatLine('————————————— End Session —————————————', file);
        assert.isUndefined(line);
      });
      it('timestamp in front - being', function(){
        var line = textual.formatLine('[00:05:51] ————————————— Begin Session —————————————', file);
        assert.isUndefined(line);
      });
      it('timestamp in front - being', function(){
        var line = textual.formatLine('[00:52:21] ————————————— End Session —————————————', file);
        assert.isUndefined(line);
      });
    });
  });

  describe('should return correctly formatted object', function(){
    it('normal global message', function(){
      var line = textual.formatLine('[2014-06-30T18:09:52+0800] <mts> inception', file);
      var expected = {
        value: '<mts> inception'
      };
      assert.equal(line.value, expected.value);
    });

    it('initial mode channel message', function(){
      var line = textual.formatLine('[2014-07-01T00:14:13+0800] Mode is +cnt', file);
      var expected = {
        value: 'Mode is +cnt'
      };
      assert.equal(line.value, expected.value);
    });

    it('message without full timestamp', function(){
      var line = textual.formatLine('[14:46:29] <mts_> oy stkhlm ', '2013-08-16.txt');
      var expected = {
        value: '<mts_> oy stkhlm'
      };
      assert.equal(line.value, expected.value);
    });
  });
});

describe('formatDate()', function(){
  it('should format date correctly', function(){
    var result = textual.formatDate('[2014-06-30T18:09:52+0800] <mts> inception', file);
    var date = '2014-06-30T';
    var time = ':09:52';

    assert.include(result, date);
    assert.include(result, time);
  });

  it('should format date correctly even when not full timestamp', function(){
    var result = textual.formatDate('[14:46:29] <mts_> oy stkhlm ', '2013-08-16.txt');
    var expected = '2013-08-16T14:46:29';

    assert.include(result, expected);
  });
});

describe("trimLine()", function() {
  it("should remove full timestamp from lines", function() {
    assert.equal(textual.trimLine('[2014-06-30T18:09:52+0800] <mts> inception'), '<mts> inception');
  });

  it("should remove small timestamp from lines", function() {
    assert.equal(textual.trimLine('[14:46:29] <mts_> oy stkhlm '), '<mts_> oy stkhlm');
  });

  it("should trim ending whitespace", function() {
    assert.equal(textual.trimLine('asd  '), 'asd');
  });
});