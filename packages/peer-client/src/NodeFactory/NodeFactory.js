import PrimaryNode from './PrimaryNode'
import SiblingNode from './SiblingNode'

class NodeFactory {
  static createInstance (context) {
    const { isPrimaryNode } = context

    if (isPrimaryNode) {
      return new PrimaryNode()
    } else {
      return new SiblingNode()
    }
  }
}

export default NodeFactory
